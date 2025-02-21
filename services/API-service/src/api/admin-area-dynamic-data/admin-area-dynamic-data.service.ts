import fs from 'fs';
import path from 'path';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  DeleteResult,
  In,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { DisasterTypeGeoServerMapper } from '../../scripts/disaster-type-geoserver-file.mapper';
import { HelperService } from '../../shared/helper.service';
import { EventAreaService } from '../admin-area/services/event-area.service';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { EventService } from '../event/event.service';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { AdminDataReturnDto } from './dto/admin-data-return.dto';
import { UploadAdminAreaDynamicDataDto } from './dto/upload-admin-area-dynamic-data.dto';
import { DynamicIndicator, TRIGGER } from './enum/dynamic-indicator.enum';
import { LeadTime } from './enum/lead-time.enum';

interface RasterData {
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class AdminAreaDynamicDataService {
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;

  public constructor(
    private eventAreaService: EventAreaService,
    private eventService: EventService,
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

    // NOTE: Temporary exception. This should be changed in pipeline, but this achieves the same result as long as that did not happen
    if (!uploadExposure.eventName) {
      uploadExposure.eventName = this.getEventNameException(
        uploadExposure.disasterType,
        uploadExposure.countryCodeISO3,
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
  }

  private getEventNameException(
    disasterType: DisasterType,
    countryCodeISO3: string,
    leadTime: LeadTime,
  ): string {
    if (disasterType === DisasterType.Malaria) {
      // NOTE: this assumes eventName=leadTime, if this changes, then this doesn't work any more
      return leadTime as string;
    } else if (
      disasterType === DisasterType.Drought &&
      countryCodeISO3 === 'ZWE'
    ) {
      return 'MAM_National';
    } else {
      return null;
    }
  }

  private async deleteDynamicDuplicates(
    uploadExposure: UploadAdminAreaDynamicDataDto,
  ): Promise<DeleteResult> {
    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      uploadExposure.disasterType,
      uploadExposure.date,
    );

    const deleteFilters = {
      indicator: uploadExposure.dynamicIndicator,
      countryCodeISO3: uploadExposure.countryCodeISO3,
      adminLevel: uploadExposure.adminLevel,
      disasterType: uploadExposure.disasterType,
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
    };
    if (uploadExposure.eventName) {
      deleteFilters['eventName'] = uploadExposure.eventName;
    }

    return this.adminAreaDynamicDataRepo.delete(deleteFilters);
  }

  public async getAdminAreaDynamicData(
    countryCodeISO3: string,
    adminLevel: number,
    indicator: DynamicIndicator,
    disasterType: DisasterType,
    leadTime: LeadTime,
    eventName: string,
  ): Promise<AdminDataReturnDto[]> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );

    // This is for now an exception to get event-polygon-level data for flash-floods. Is the intended direction for all disaster-types.
    if (disasterType === DisasterType.FlashFloods && !eventName) {
      return await this.eventAreaService.getEventAreaDynamicData(
        countryCodeISO3,
        disasterType,
        indicator,
        lastUploadDate,
      );
    }

    // NOTE: 'trigger' is a calculated field, and not actually in db. The calculation is done here.
    if (indicator === TRIGGER) {
      // NOTE: this only gets alert areas, not all, but that is actually fine for the front-end
      const alertAreas = await this.eventService.getActiveAlertAreas(
        countryCodeISO3,
        disasterType,
        adminLevel,
        lastUploadDate,
        eventName,
      );
      return alertAreas.map((area) => ({
        value: area.forecastTrigger ? 1 : 0,
        placeCode: area.placeCode,
      }));
    }

    const whereFilters = {
      countryCodeISO3,
      adminLevel: Number(adminLevel),
      indicator,
      disasterType,
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
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
