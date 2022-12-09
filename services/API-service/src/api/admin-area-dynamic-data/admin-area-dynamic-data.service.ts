import { LeadTime, LeadTimeUnit } from './enum/lead-time.enum';
import { DynamicDataPlaceCodeDto } from './dto/dynamic-data-place-code.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Connection, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { DynamicIndicator } from './enum/dynamic-data-unit';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { UploadTriggerPerLeadTimeDto } from '../event/dto/upload-trigger-per-leadtime.dto';
import { EventService } from '../event/event.service';
import { DisasterEntity } from '../disaster/disaster.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import fs from 'fs';
import { CountryEntity } from '../country/country.entity';
import { HelperService } from '../../shared/helper.service';

@Injectable()
export class AdminAreaDynamicDataService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(
    private eventService: EventService,
    private helperService: HelperService,
    private connection: Connection,
  ) {}

  public async exposure(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    // Delete existing entries in case of a re-run of the pipeline for some reason
    await this.deleteDynamicDuplicates(uploadExposure);

    const areas = [];
    for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
      const area = new AdminAreaDynamicDataEntity();
      area.indicator = uploadExposure.dynamicIndicator;
      area.value = exposurePlaceCode.amount;
      area.adminLevel = uploadExposure.adminLevel;
      area.placeCode = exposurePlaceCode.placeCode;
      area.date = new Date();
      area.timestamp = new Date();
      area.countryCodeISO3 = uploadExposure.countryCodeISO3;
      area.leadTime = uploadExposure.leadTime;
      area.disasterType = uploadExposure.disasterType;
      area.eventName = uploadExposure.eventName;
      areas.push(area);
    }
    await this.adminAreaDynamicDataRepo.save(areas);

    const disasterType = await this.disasterTypeRepository.findOne({
      select: ['triggerUnit'],
      where: { disasterType: uploadExposure.disasterType },
    });

    const country = await this.countryRepository.findOne({
      relations: ['countryDisasterSettings'],
      where: { countryCodeISO3: uploadExposure.countryCodeISO3 },
    });

    if (
      disasterType.triggerUnit === uploadExposure.dynamicIndicator &&
      country.countryDisasterSettings.find(
        s => s.disasterType === uploadExposure.disasterType,
      ).defaultAdminLevel === uploadExposure.adminLevel
    ) {
      await this.insertTrigger(uploadExposure);

      await this.eventService.processEventAreas(
        uploadExposure.countryCodeISO3,
        uploadExposure.disasterType,
        uploadExposure.adminLevel,
        uploadExposure.eventName,
      );
    }
  }

  private async deleteDynamicDuplicates(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    if (uploadExposure.leadTime.includes(LeadTimeUnit.month)) {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      await this.adminAreaDynamicDataRepo.delete({
        indicator: uploadExposure.dynamicIndicator,
        countryCodeISO3: uploadExposure.countryCodeISO3,
        leadTime: uploadExposure.leadTime,
        adminLevel: uploadExposure.adminLevel,
        disasterType: uploadExposure.disasterType,
        eventName: uploadExposure.eventName || IsNull(),
        date: MoreThanOrEqual(firstDayOfMonth),
      });
    } else if (uploadExposure.leadTime.includes(LeadTimeUnit.hour)) {
      // Do not overwrite based on 'leadTime' as typhoon should also overwrite if lead-time has changed (as it's a calculated field, instead of fixed)
      await this.adminAreaDynamicDataRepo.delete({
        indicator: uploadExposure.dynamicIndicator,
        countryCodeISO3: uploadExposure.countryCodeISO3,
        adminLevel: uploadExposure.adminLevel,
        disasterType: uploadExposure.disasterType,
        date: new Date(),
        eventName: uploadExposure.eventName || IsNull(),
        timestamp: MoreThanOrEqual(
          this.helperService.getLast6hourInterval(uploadExposure.disasterType),
        ),
      });
    } else {
      await this.adminAreaDynamicDataRepo.delete({
        indicator: uploadExposure.dynamicIndicator,
        countryCodeISO3: uploadExposure.countryCodeISO3,
        leadTime: uploadExposure.leadTime,
        adminLevel: uploadExposure.adminLevel,
        disasterType: uploadExposure.disasterType,
        eventName: uploadExposure.eventName || IsNull(),
        date: new Date(),
      });
    }
  }

  private async insertTrigger(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    const trigger = this.isThereTrigger(uploadExposure.exposurePlaceCodes);

    const eventBelowTrigger = !trigger && !!uploadExposure.eventName;

    const uploadTriggerPerLeadTimeDto = new UploadTriggerPerLeadTimeDto();
    uploadTriggerPerLeadTimeDto.countryCodeISO3 =
      uploadExposure.countryCodeISO3;
    uploadTriggerPerLeadTimeDto.disasterType = uploadExposure.disasterType;
    uploadTriggerPerLeadTimeDto.eventName = uploadExposure.eventName;
    uploadTriggerPerLeadTimeDto.triggersPerLeadTime = [
      {
        leadTime: uploadExposure.leadTime as LeadTime,
        triggered: trigger || eventBelowTrigger,
        thresholdReached: trigger && !eventBelowTrigger,
      },
    ];
    await this.eventService.uploadTriggerPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  private isThereTrigger(
    exposurePlaceCodes: DynamicDataPlaceCodeDto[],
  ): boolean {
    for (const exposurePlaceCode of exposurePlaceCodes) {
      if (Number(exposurePlaceCode.amount) > 0) {
        return true;
      }
    }
    return false;
  }

  public async getAdminAreaDynamicData(
    countryCodeISO3: string,
    adminLevel: string,
    leadTime: LeadTime,
    indicator: DynamicIndicator,
    disasterType: DisasterType,
    eventName: string,
  ): Promise<AdminDataReturnDto[]> {
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .where({
        countryCodeISO3: countryCodeISO3,
        adminLevel: Number(adminLevel),
        leadTime: leadTime,
        indicator: indicator,
        disasterType: disasterType,
        eventName: eventName === 'no-name' ? IsNull() : eventName,
        date: lastTriggeredDate.date,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast6hourInterval(
            disasterType,
            lastTriggeredDate.timestamp,
          ),
        ),
      })
      .select(['dynamic.value AS value', 'dynamic.placeCode AS "placeCode"'])
      .orderBy('dynamic.date', 'DESC')
      .execute();
    return result;
  }

  public async getDynamicAdminAreaDataPerPcode(
    indicator: DynamicIndicator,
    placeCode: string,
    leadTime: string,
    eventName: string,
  ): Promise<number> {
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .where({
        indicator: indicator,
        placeCode: placeCode,
        leadTime: leadTime,
        eventName: eventName === 'no-name' ? IsNull() : eventName,
      })
      .select(['dynamic.value AS value'])
      .orderBy('dynamic.date', 'DESC')
      .execute();
    return result[0].value;
  }

  public async postRaster(
    data: any,
    disasterType: DisasterType,
  ): Promise<void> {
    let subfolder: string;
    if (disasterType === DisasterType.Floods) {
      subfolder = 'flood_extents';
    } else if (
      [DisasterType.HeavyRain, DisasterType.Drought].includes(disasterType)
    ) {
      subfolder = 'rainfall_extents';
    } else {
      throw new HttpException(
        'Disaster Type not allowed',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      fs.writeFileSync(
        `./geoserver-volume/raster-files/output/${subfolder}/${data.originalname}`,
        data.buffer,
      );
    } catch (e) {
      console.error(e);
      throw new HttpException('File not written: ' + e, HttpStatus.NOT_FOUND);
    }
  }

  public async archiveOldDynamicData() {
    // for now do this only for floods as it is the bulk of the data, and the easiest to handle
    const maxDate = await this.adminAreaDynamicDataRepo
      .createQueryBuilder()
      .select(['"countryCodeISO3"', 'MAX("date") AS max_date'])
      .groupBy('"countryCodeISO3"')
      .where({ disasterType: DisasterType.Floods })
      .getRawMany();

    // Move to separate archive-table
    const repository = this.connection.getRepository(
      AdminAreaDynamicDataEntity,
    );
    const archiveTableExists = (
      await this.connection.query(
        `SELECT exists (
            SELECT FROM information_schema.tables
              WHERE  table_schema = '${repository.metadata.schema}'
              AND    table_name   = '${repository.metadata.tableName}-archive'
              )`,
      )
    )[0].exists;
    for await (const country of maxDate) {
      if (archiveTableExists) {
        await this.connection.query(
          `INSERT INTO "${repository.metadata.schema}"."${repository.metadata.tableName}-archive" \
            SELECT * \
            FROM "${repository.metadata.schema}"."${repository.metadata.tableName}" \
            WHERE "disasterType" = $1 \
            AND "countryCodeISO3" = $2 \
            AND date < $3`,
          [DisasterType.Floods, country.countryCodeISO3, country.max_date],
        );
      } else {
        await this.connection.query(
          `SELECT * \
            INTO "${repository.metadata.schema}"."${repository.metadata.tableName}-archive" \
            FROM "${repository.metadata.schema}"."${repository.metadata.tableName}" \
            WHERE "disasterType" = $1 \
            AND "countryCodeISO3" = $2 \
            AND date < $3`,
          [DisasterType.Floods, country.countryCodeISO3, country.max_date],
        );
      }

      await this.connection.query(
        `DELETE \
          FROM "${repository.metadata.schema}"."${repository.metadata.tableName}" \
          WHERE "disasterType" = $1 \
          AND "countryCodeISO3" = $2 \
          AND date < $3`,
        [DisasterType.Floods, country.countryCodeISO3, country.max_date],
      );
    }
  }
}
