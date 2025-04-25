import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { InsertResult, MoreThanOrEqual, Repository } from 'typeorm';

import { AggregateDataRecord } from '../../shared/data.model';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { AdminAreaDataEntity } from '../admin-area-data/admin-area-data.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { DynamicIndicator } from '../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { DisasterTypeService } from '../disaster-type/disaster-type.service';
import { LastUploadDateDto } from '../event/dto/last-upload-date.dto';
import { EventService } from '../event/event.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
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
    private disasterTypeService: DisasterTypeService,
  ) {}

  public async addOrUpdateAdminAreas(
    countryCodeISO3: string,
    adminLevel: number,
    adminAreasGeoJson: GeoJson,
  ) {
    //delete existing entries for country & adminlevel first
    await this.adminAreaRepository.delete({ countryCodeISO3, adminLevel });

    const adminAreas = this.processPreUploadExceptions(adminAreasGeoJson);

    // then upload new admin-areas
    await Promise.all(
      adminAreas.features.map((area): Promise<InsertResult> => {
        return this.adminAreaRepository
          .createQueryBuilder()
          .insert()
          .values({
            countryCodeISO3,
            adminLevel,
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
    lastUploadDate: LastUploadDateDto,
  ) {
    const alertsPerLeadTime =
      (await this.eventService.getAlertPerLeadTime(
        countryCodeISO3,
        disasterType,
        eventName,
      )) ?? {};
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
        await this.eventService.getActiveAlertAreas(
          countryCodeISO3,
          disasterType,
          adminLevel,
          lastUploadDate,
          eventName,
        )
      ).map((triggeredArea): string => triggeredArea.placeCode);
    }
    return placeCodes;
  }

  public async getPlaceCodes(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
    eventName: string,
    lastUploadDate: LastUploadDateDto,
  ) {
    const disasterTypeEntity = await this.disasterTypeRepository.findOne({
      where: { disasterType },
    });
    // REFACTOR: exact working if this property and code very unclear
    if (disasterTypeEntity.showOnlyTriggeredAreas) {
      return await this.getTriggeredPlaceCodes(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
        eventName,
        lastUploadDate,
      );
    } else {
      return await this.getPlaceCodesToShow(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
        eventName,
        lastUploadDate,
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
      lastUploadDate,
    );
    let staticIndicatorsScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select(['area."placeCode"', 'area."placeCodeParent"'])
      .leftJoin(AdminAreaDataEntity, 'data', 'area.placeCode = data.placeCode')
      .addSelect(['data."indicator"', 'data."value"'])
      .where({ countryCodeISO3, adminLevel });

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
    const areasWithStaticIndicators = await staticIndicatorsScript.getRawMany();

    let dynamicIndicatorsScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select(['area."placeCode", area."placeCodeParent"'])
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'dynamic',
        'area.placeCode = dynamic.placeCode',
      )
      .addSelect(['dynamic."indicator"', 'dynamic."value"'])
      .leftJoin(
        EventPlaceCodeEntity,
        'epc',
        'area.id = epc.adminAreaId AND epc.closed = false AND epc."disasterType" = :disasterType',
        { disasterType },
      )
      .addSelect([
        'epc."forecastSeverity"',
        'epc."forecastTrigger"',
        'epc."userTrigger"',
      ])
      .where({ countryCodeISO3, adminLevel })
      .andWhere('dynamic."disasterType" = :disasterType', { disasterType })
      .andWhere('dynamic.timestamp >= :cutoffMoment', {
        cutoffMoment: lastUploadDate.cutoffMoment,
      });

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

    let areasWithDynamicIndicators = await dynamicIndicatorsScript.getRawMany();
    areasWithDynamicIndicators.forEach((area) => {
      area.alertLevel = this.eventService.getAlertLevel(area);
    });
    const highestAlertLevels = this.eventService.getHighestAlertLevelPerEvent(
      areasWithDynamicIndicators,
    );
    areasWithDynamicIndicators = areasWithDynamicIndicators.filter(
      (area) =>
        area.alertLevel === highestAlertLevels[area.eventName || 'unknown'],
    );

    // REFACTOR: the returned records still include forecastTrigger etc, which were needed to get alertLevel, but no need to return them also. This whole method is unnecessarily complex, so better to refactor as a whole.
    return areasWithStaticIndicators.concat(areasWithDynamicIndicators);
  }

  public async getAdminAreasRaw(countryCodeISO3: string) {
    return await this.adminAreaRepository.find({
      select: [
        'countryCodeISO3',
        'name',
        'placeCode',
        'placeCodeParent',
        'adminLevel',
        'geom',
      ],
      where: { countryCodeISO3 },
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
    const disasterTypeEntity =
      await this.disasterTypeService.getDisasterType(disasterType);
    const lastUploadDate = await this.helperService.getLastUploadDate(
      countryCodeISO3,
      disasterType,
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
      .leftJoin(
        EventPlaceCodeEntity,
        'epc',
        'area.id = epc.adminAreaId AND epc.closed = false AND epc."disasterType" = :disasterType',
        { disasterType },
      )
      .addSelect([
        'epc."forecastSeverity"',
        'epc."forecastTrigger"',
        'epc."userTrigger"',
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
      .andWhere('timestamp >= :cutoffMoment', {
        cutoffMoment: lastUploadDate.cutoffMoment,
      })
      .andWhere('dynamic.disasterType = :disasterType', { disasterType })
      .andWhere('dynamic."indicator" = :indicator', {
        indicator: disasterTypeEntity.mainExposureIndicator,
      });
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
      lastUploadDate,
    );

    if (placeCodes.length) {
      adminAreasScript = adminAreasScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes },
      );
    }

    // order orderBy
    adminAreasScript = adminAreasScript
      .orderBy('dynamic."leadTime"', 'DESC') // This makes sure that if an area is part of 2 events, the earlier event is first and therefore on "top" in the map, so that on clicking the area in the map the earliest event is selected.
      .addOrderBy('area."placeCode"');

    let adminAreas = await adminAreasScript.getRawMany();
    adminAreas.forEach((area) => {
      area.alertLevel = this.eventService.getAlertLevel(area);
    });
    const highestAlertLevels =
      this.eventService.getHighestAlertLevelPerEvent(adminAreas);
    adminAreas = adminAreas.filter(
      (area) =>
        area.alertLevel === highestAlertLevels[area.eventName || 'unknown'],
    );
    return this.helperService.toGeojson(adminAreas);
  }

  private async getPlaceCodesToShow(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
    lastUploadDate: LastUploadDateDto,
  ) {
    const whereFilters = {
      countryCodeISO3,
      disasterType,
      adminLevel,
      timestamp: MoreThanOrEqual(lastUploadDate.cutoffMoment),
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
