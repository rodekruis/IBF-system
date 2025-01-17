import fs from 'fs';
import path from 'path';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, In, IsNull, MoreThanOrEqual, Repository } from 'typeorm';

import { DisasterTypeGeoServerMapper } from '../../scripts/disaster-type-geoserver-file.mapper';
import { HelperService } from '../../shared/helper.service';
import { EventAreaService } from '../admin-area/services/event-area.service';
import { CountryEntity } from '../country/country.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { UploadTriggerPerLeadTimeDto } from '../event/dto/upload-trigger-per-leadtime.dto';
import { EventService } from '../event/event.service';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { DynamicDataPlaceCodeDto } from './dto/dynamic-data-place-code.dto';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { DynamicIndicator } from './enum/dynamic-data-unit';
import { LeadTime } from './enum/lead-time.enum';

interface RasterData {
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class AdminAreaDynamicDataService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public constructor(
    private eventService: EventService,
    private eventAreaService: EventAreaService,
    private helperService: HelperService,
    private dataSource: DataSource,
  ) {}

  public async exposure(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    uploadExposure.date = this.helperService.setDayToLastDayOfMonth(
      uploadExposure.date,
      uploadExposure.leadTime,
    );

    // NOTE: This should be changed in pipeline, but this achieves the same result as long as that did not happen
    // NOTE: this assumes eventName=leadTime, if this changes, then this doesn't work any more
    if (!uploadExposure.eventName) {
      uploadExposure.eventName = this.getMalariaEventNameException(
        uploadExposure.disasterType,
        uploadExposure.leadTime,
      );
    }

    // Delete existing entries in case of a re-run of the pipeline for some reason
    await this.deleteDynamicDuplicates(uploadExposure);

    const areas = [];
    for (const exposurePlaceCode of uploadExposure.exposurePlaceCodes) {
      const area = new AdminAreaDynamicDataEntity();
      area.indicator = uploadExposure.dynamicIndicator;
      area.value = exposurePlaceCode.amount;
      area.adminLevel = uploadExposure.adminLevel;
      area.placeCode = exposurePlaceCode.placeCode;
      area.date = uploadExposure.date || new Date();
      area.timestamp = uploadExposure.date || new Date();
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
      uploadExposure.exposurePlaceCodes.length > 0 &&
      country.countryDisasterSettings.find(
        (s) => s.disasterType === uploadExposure.disasterType,
      ).defaultAdminLevel === uploadExposure.adminLevel
    ) {
      await this.insertTrigger(uploadExposure);

      await this.eventService.processEventAreas(
        uploadExposure.countryCodeISO3,
        uploadExposure.disasterType,
        uploadExposure.adminLevel,
        uploadExposure.eventName,
        uploadExposure.date || new Date(),
      );
    }
  }

  private getMalariaEventNameException(
    disasterType: DisasterType,
    leadTime: LeadTime,
  ): string {
    if (disasterType === DisasterType.Malaria) {
      return leadTime as string;
    }
    return null;
  }

  private async deleteDynamicDuplicates(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<void> {
    const deleteFilters = {
      indicator: uploadExposure.dynamicIndicator,
      countryCodeISO3: uploadExposure.countryCodeISO3,
      adminLevel: uploadExposure.adminLevel,
      disasterType: uploadExposure.disasterType,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          uploadExposure.disasterType,
          uploadExposure.date,
        ),
      ),
    };
    if (uploadExposure.eventName) {
      deleteFilters['eventName'] = uploadExposure.eventName;
    }
    // Only filter on leadTime when using fixed LeadTime / not using events
    if (uploadExposure.disasterType === DisasterType.HeavyRain) {
      deleteFilters['leadTime'] = uploadExposure.leadTime as LeadTime;
    }
    await this.adminAreaDynamicDataRepo.delete(deleteFilters);
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
    uploadTriggerPerLeadTimeDto.date = uploadExposure.date || new Date();
    await this.eventService.uploadTriggerPerLeadTime(
      uploadTriggerPerLeadTimeDto,
    );
  }

  private isThereTrigger(
    exposurePlaceCodes: DynamicDataPlaceCodeDto[],
  ): boolean {
    for (const exposurePlaceCode of exposurePlaceCodes) {
      if (Number(exposurePlaceCode.amount) === 1) {
        return true;
      }
    }
    return false;
  }

  public async getAdminAreaDynamicData(
    countryCodeISO3: string,
    adminLevel: string,
    indicator: DynamicIndicator,
    disasterType: DisasterType,
    leadTime: LeadTime,
    eventName: string,
  ): Promise<AdminDataReturnDto[]> {
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    // This is for now an exception to get event-polygon-level data for flash-floods. Is the intended direction for all disaster-types.
    if (disasterType === DisasterType.FlashFloods && !eventName) {
      return await this.eventAreaService.getEventAreaDynamicData(
        countryCodeISO3,
        disasterType,
        indicator,
        lastTriggeredDate,
      );
    }

    const whereFilters = {
      countryCodeISO3: countryCodeISO3,
      adminLevel: Number(adminLevel),
      indicator: indicator,
      disasterType: disasterType,
      timestamp: MoreThanOrEqual(
        this.helperService.getUploadCutoffMoment(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      ),
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }
    if (leadTime) {
      whereFilters['leadTime'] = leadTime;
    }
    const result = await this.adminAreaDynamicDataRepo
      .createQueryBuilder('dynamic')
      .where(whereFilters)
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
        indicator,
        placeCode,
        leadTime,
        eventName: eventName === 'no-name' || !eventName ? IsNull() : eventName,
      })
      .select(['dynamic.value AS value'])
      .orderBy('dynamic.date', 'DESC')
      .execute();
    return result[0].value;
  }

  public async postRaster(
    data: RasterData,
    disasterType: DisasterType,
  ): Promise<void> {
    const subfolder =
      DisasterTypeGeoServerMapper.getSubfolderForDisasterType(disasterType);
    if (subfolder === '') {
      throw new HttpException(
        'Disaster Type not allowed',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const ROOT_DIR = path.resolve('./geoserver-volume/raster-files/output');
      const filePath = path.resolve(
        ROOT_DIR,
        `${subfolder}/${data.originalname}`,
      );
      if (!filePath.startsWith(ROOT_DIR)) {
        throw new Error('Invalid file path');
      }
      fs.writeFileSync(filePath, data.buffer);
    } catch (e) {
      console.error(e);
      throw new HttpException('File not written: ' + e, HttpStatus.NOT_FOUND);
    }
  }

  public async archiveOldDynamicData() {
    // for now do this only for daily/hourly disaster-types as it is the bulk of the data, and the easiest to handle
    const maxDate = await this.adminAreaDynamicDataRepo
      .createQueryBuilder()
      .select([
        '"countryCodeISO3"',
        '"disasterType"',
        'MAX("date") AS max_date',
      ])
      .groupBy('"countryCodeISO3"')
      .addGroupBy('"disasterType"')
      .where({
        disasterType: In([
          DisasterType.Floods,
          DisasterType.Typhoon,
          DisasterType.HeavyRain,
          DisasterType.FlashFloods,
        ]),
      })
      .getRawMany();

    // Move to separate archive-table
    const repository = this.dataSource.getRepository(
      AdminAreaDynamicDataEntity,
    );
    const archiveTableExists = (
      await this.dataSource.query(
        `SELECT exists (
            SELECT FROM information_schema.tables
              WHERE  table_schema = '${repository.metadata.schema}'
              AND    table_name   = '${repository.metadata.tableName}-archive'
              )`,
      )
    )[0].exists;
    for await (const item of maxDate) {
      if (archiveTableExists) {
        await this.dataSource.query(
          `INSERT INTO "${repository.metadata.schema}"."${repository.metadata.tableName}-archive" \
            SELECT * \
            FROM "${repository.metadata.schema}"."${repository.metadata.tableName}" \
            WHERE "disasterType" = $1 \
            AND "countryCodeISO3" = $2 \
            AND date < $3`,
          [item.disasterType, item.countryCodeISO3, item.max_date],
        );
      } else {
        await this.dataSource.query(
          `SELECT * \
            INTO "${repository.metadata.schema}"."${repository.metadata.tableName}-archive" \
            FROM "${repository.metadata.schema}"."${repository.metadata.tableName}" \
            WHERE "disasterType" = $1 \
            AND "countryCodeISO3" = $2 \
            AND date < $3`,
          [item.disasterType, item.countryCodeISO3, item.max_date],
        );
      }

      await this.dataSource.query(
        `DELETE \
          FROM "${repository.metadata.schema}"."${repository.metadata.tableName}" \
          WHERE "disasterType" = $1 \
          AND "countryCodeISO3" = $2 \
          AND date < $3`,
        [item.disasterType, item.countryCodeISO3, item.max_date],
      );
    }
  }
}
