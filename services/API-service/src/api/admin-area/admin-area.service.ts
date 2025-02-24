import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { InsertResult, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';

import { AggregateDataRecord } from '../../shared/data.model';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { AdminAreaDataEntity } from '../admin-area-data/admin-area-data.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import {
  ALERT_THRESHOLD,
  DynamicIndicator,
} from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { EventService } from '../event/event.service';
import { AdminAreaEntity } from './admin-area.entity';
import { EventAreaService } from './services/event-area.service';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<AdminAreaDynamicDataEntity>;

  public constructor(
    private helperService: HelperService,
    private eventService: EventService,
    private eventAreaService: EventAreaService,
  ) {}

  public async addOrUpdateAdminAreas(
    countryCodeISO3: string,
    adminLevel: number,
    adminAreasGeoJson: GeoJson,
  ) {
    //delete existing entries for country & adminlevel first
    await this.adminAreaRepository.delete({
      countryCodeISO3: countryCodeISO3,
      adminLevel: adminLevel,
    });

    const adminAreas = this.processPreUploadExceptions(adminAreasGeoJson);

    // then upload new admin-areas
    await Promise.all(
      adminAreas.features.map((area): Promise<InsertResult> => {
        return this.adminAreaRepository
          .createQueryBuilder()
          .insert()
          .values({
            countryCodeISO3: countryCodeISO3,
            adminLevel: adminLevel,
            name: area.properties[`ADM${adminLevel}_EN`],
            placeCode: area.properties[`ADM${adminLevel}_PCODE`],
            placeCodeParent:
              area.properties[`ADM${adminLevel - 1}_PCODE`] || null,
            geom: (): string => this.geomFunction(area.geometry.coordinates),
          })
          .execute();
      }),
    );
  }

  private processPreUploadExceptions(adminAreasGeoJson: GeoJson) {
    for (const adminArea of adminAreasGeoJson.features) {
      if (adminArea.properties['ADM2_PCODE'] === 'SS0303') {
        adminArea.properties['ADM2_EN'] = 'Bor South County';
      }
    }
    return adminAreasGeoJson;
  }

  private geomFunction(coordinates): string {
    return `ST_GeomFromGeoJSON( '{ "type": "MultiPolygon", "coordinates": ${JSON.stringify(
      coordinates,
    )} }' )`;
  }

  private async getTriggeredPlaceCodes(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ) {
    const alertsPerLeadTime = await this.eventService.getAlertPerLeadTime(
      countryCodeISO3,
      disasterType,
      eventName,
    );
    let trigger;
    if (leadTime) {
      trigger = alertsPerLeadTime[leadTime];
    } else {
      const leadTimeKeys = Object.keys(alertsPerLeadTime).filter((key) =>
        Object.values(LeadTime).includes(key as LeadTime),
      );
      for (const key of leadTimeKeys) {
        if (alertsPerLeadTime[key] === '1') {
          trigger = '1';
          break;
        }
      }
    }

    let placeCodes = [];
    if (parseInt(trigger) === 1) {
      placeCodes = (
        await this.getTriggeredAreasPerAdminLevel(
          countryCodeISO3,
          disasterType,
          adminLevel,
          leadTime,
          eventName,
        )
      ).map((triggeredArea): string => triggeredArea.placeCode);
    }
    return placeCodes;
  }

  private async getTriggeredAreasPerAdminLevel(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ): Promise<AdminAreaDynamicDataEntity[]> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      disasterType,
      lastUploadDate.timestamp,
    );

    const whereFilters = {
      countryCodeISO3: countryCodeISO3,
      disasterType: disasterType,
      adminLevel: adminLevel,
      value: MoreThan(0),
      indicator: triggerIndicator as DynamicIndicator,
      timestamp: MoreThanOrEqual(uploadCutoffMoment),
    };
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }
    if (leadTime) {
      whereFilters['leadTime'] = leadTime;
    }

    return this.adminAreaDynamicDataRepo
      .createQueryBuilder()
      .where(whereFilters)
      .getMany();
  }

  public async getPlaceCodes(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
    eventName: string,
  ) {
    const disasterTypeEntity = await this.disasterTypeRepository.findOne({
      where: { disasterType: disasterType },
    });
    // REFACTOR: exact working if this property and code very unclear
    if (disasterTypeEntity.showOnlyTriggeredAreas) {
      return await this.getTriggeredPlaceCodes(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
        eventName,
      );
    } else {
      return await this.getPlaceCodesToShow(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
        eventName,
      );
    }
  }

  public async getAggregatesData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
    placeCodeParent?: string,
  ): Promise<AggregateDataRecord[]> {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );

    // This is for now an exception to get event-polygon-level data for flash-floods. Is the intended direction for all disaster-types.
    if (disasterType === DisasterType.FlashFloods && !eventName) {
      return await this.eventAreaService.getEventAreaAggregates(
        countryCodeISO3,
        disasterType,
        lastUploadDate,
      );
    }

    const placeCodes = await this.getPlaceCodes(
      countryCodeISO3,
      disasterType,
      leadTime,
      adminLevel,
      eventName,
    );
    let staticIndicatorsScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select(['area."placeCode"', 'area."placeCodeParent"'])
      .leftJoin(AdminAreaDataEntity, 'data', 'area.placeCode = data.placeCode')
      .addSelect(['data."indicator"', 'data."value"'])
      .where('area."countryCodeISO3" = :countryCodeISO3', { countryCodeISO3 })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel });

    if (placeCodeParent) {
      staticIndicatorsScript.andWhere(
        'area."placeCodeParent" = :placeCodeParent',
        { placeCodeParent },
      );
    }
    if (placeCodes.length) {
      staticIndicatorsScript = staticIndicatorsScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes },
      );
    }
    const staticIndicators = await staticIndicatorsScript.getRawMany();

    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      disasterType,
      lastUploadDate.timestamp,
    );

    let dynamicIndicatorsScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select(['area."placeCode", area."placeCodeParent"'])
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'dynamic',
        'area.placeCode = dynamic.placeCode',
      )
      .addSelect(['dynamic."indicator"', 'dynamic."value"'])
      .where('area."countryCodeISO3" = :countryCodeISO3', { countryCodeISO3 })
      .andWhere('timestamp >= :uploadCutoffMoment', { uploadCutoffMoment })
      .andWhere('"disasterType" = :disasterType', { disasterType })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel });

    if (placeCodeParent) {
      dynamicIndicatorsScript.andWhere(
        'area."placeCodeParent" = :placeCodeParent',
        { placeCodeParent },
      );
    }
    if (leadTime) {
      dynamicIndicatorsScript.andWhere('dynamic."leadTime" = :leadTime', {
        leadTime,
      });
    }
    if (eventName) {
      dynamicIndicatorsScript.andWhere('dynamic."eventName" = :eventName', {
        eventName,
      });
    }
    if (placeCodes.length) {
      dynamicIndicatorsScript = dynamicIndicatorsScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes },
      );
    }

    const dynamicIndicators = await dynamicIndicatorsScript.getRawMany();
    return staticIndicators.concat(dynamicIndicators);
  }

  private async getDisasterType(
    disasterType: DisasterType,
  ): Promise<DisasterTypeEntity> {
    return this.disasterTypeRepository.findOne({ where: { disasterType } });
  }

  public async getAdminAreasRaw(countryCodeISO3) {
    return await this.adminAreaRepository.find({
      select: [
        'countryCodeISO3',
        'name',
        'placeCode',
        'placeCodeParent',
        'adminLevel',
        'geom',
      ],
      where: {
        countryCodeISO3: countryCodeISO3,
      },
    });
  }

  public async getAdminAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
    placeCodeParent?: string,
  ): Promise<GeoJson> {
    const disasterTypeEntity = await this.getDisasterType(disasterType);
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const uploadCutoffMoment = this.helperService.getUploadCutoffMoment(
      disasterType,
      lastUploadDate.timestamp,
    );

    // This is for now an exception to get event-polygon-level data for flash-floods. Is the intended direction for all disaster-types.
    if (disasterType === DisasterType.FlashFloods && !eventName) {
      return await this.eventAreaService.getEventAreas(
        countryCodeISO3,
        disasterTypeEntity,
        lastUploadDate,
      );
    }

    let adminAreasScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select([
        'area."placeCode"',
        'area."name"',
        'area."adminLevel"',
        'ST_AsGeoJSON(area.geom)::json As geom',
        'area."countryCodeISO3"',
      ])
      .where('area."countryCodeISO3" = :countryCodeISO3', { countryCodeISO3 })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel });
    if (placeCodeParent) {
      adminAreasScript.andWhere('area."placeCodeParent" = :placeCodeParent', {
        placeCodeParent,
      });
    }

    adminAreasScript = adminAreasScript
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'dynamic',
        'area.placeCode = dynamic.placeCode',
      )
      .leftJoin(
        AdminAreaEntity,
        'parent',
        'area."placeCodeParent" = parent."placeCode"',
      )
      .addSelect([
        `dynamic.value AS ${disasterTypeEntity.mainExposureIndicator}`,
        'dynamic."leadTime"',
        'dynamic."date"',
        'parent.name AS "nameParent"',
        'parent."placeCode" as "placeCodeParent"',
        'dynamic."eventName"',
      ])
      .andWhere('timestamp >= :uploadCutoffMoment', { uploadCutoffMoment })
      .andWhere('"disasterType" = :disasterType', { disasterType })
      .andWhere('dynamic."indicator" = :indicator', {
        indicator: disasterTypeEntity.mainExposureIndicator,
      })
      .orderBy('dynamic."leadTime"', 'DESC'); // This makes sure that if an area is part of 2 events, the earlier event is first and therefore on "top" in the map, so that on clicking the area in the map the earliest event is selected.

    if (leadTime) {
      adminAreasScript.andWhere('dynamic."leadTime" = :leadTime', { leadTime });
    }
    if (eventName) {
      adminAreasScript.andWhere('dynamic."eventName" = :eventName', {
        eventName,
      });
    }

    const placeCodes = await this.getPlaceCodes(
      countryCodeISO3,
      disasterType,
      leadTime,
      adminLevel,
      eventName,
    );

    if (placeCodes.length) {
      adminAreasScript = adminAreasScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes },
      );
    }

    const adminAreas = await adminAreasScript.getRawMany();
    return this.helperService.toGeojson(adminAreas);
  }

  private async getPlaceCodesToShow(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ) {
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
    );
    const uplaodCutoffMoment = this.helperService.getUploadCutoffMoment(
      disasterType,
      lastUploadDate.timestamp,
    );

    const whereFilters = {
      countryCodeISO3: countryCodeISO3,
      disasterType: disasterType,
      adminLevel: adminLevel,
      timestamp: MoreThanOrEqual(uplaodCutoffMoment),
      indicator: DynamicIndicator.showAdminArea,
      value: 1,
    };

    if (leadTime) {
      whereFilters['leadTime'] = leadTime;
    }
    if (eventName) {
      whereFilters['eventName'] = eventName;
    }

    const adminAreasToShow = await this.adminAreaDynamicDataRepo
      .createQueryBuilder()
      .where(whereFilters)
      .getMany();

    // The 'showAdminArea' indicator queried for above is only used in Typhoon. Theoretically it could be used more widespread.
    // If no data found, this will correctly return an empty array.
    return adminAreasToShow.map((area) => area.placeCode);
  }
}
