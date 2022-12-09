import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { InsertResult, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { AdminAreaEntity } from './admin-area.entity';
import { EventService } from '../event/event.service';
import { AggregateDataRecord } from 'src/shared/data.model';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaDataEntity } from '../admin-area-data/admin-area-data.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';
import { DynamicIndicator } from '../admin-area-dynamic-data/enum/dynamic-data-unit';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;
  @InjectRepository(AdminAreaDynamicDataEntity)
  private readonly adminAreaDynamicDataRepo: Repository<
    AdminAreaDynamicDataEntity
  >;

  public constructor(
    private helperService: HelperService,
    private eventService: EventService,
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

    // then upload new admin-areas
    await Promise.all(
      adminAreasGeoJson.features.map(
        (area): Promise<InsertResult> => {
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
        },
      ),
    );
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
    const trigger = (
      await this.eventService.getTriggerPerLeadtime(
        countryCodeISO3,
        disasterType,
        eventName,
      )
    )[leadTime];

    let placeCodes = [];
    if (parseInt(trigger) === 1) {
      placeCodes = (
        await this.getTriggeredAreasPerAdminLevel(
          countryCodeISO3,
          disasterType,
          adminLevel,
          leadTime,
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
  ): Promise<AdminAreaDynamicDataEntity[]> {
    const triggerUnit = await this.eventService.getTriggerUnit(disasterType);
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    return await this.adminAreaDynamicDataRepo.find({
      where: {
        countryCodeISO3: countryCodeISO3,
        disasterType: disasterType,
        adminLevel: adminLevel,
        leadTime: leadTime,
        value: MoreThan(0),
        indicator: triggerUnit,
        date: lastTriggeredDate.date,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast6hourInterval(
            disasterType,
            lastTriggeredDate.timestamp,
          ),
        ),
      },
    });
  }

  public async getPlaceCodes(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
    eventName: string,
  ) {
    // For these disaster-types show only triggered areas. For others show all.
    if ([DisasterType.Floods, DisasterType.HeavyRain].includes(disasterType)) {
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
      );
    }
  }

  public async getAggregatesData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
    eventName: string,
  ): Promise<AggregateDataRecord[]> {
    const placeCodes = await this.getPlaceCodes(
      countryCodeISO3,
      disasterType,
      leadTime,
      adminLevel,
      eventName,
    );
    let staticIndicatorsScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select(['area."placeCode"'])
      .leftJoin(AdminAreaDataEntity, 'data', 'area.placeCode = data.placeCode')
      .addSelect(['data."indicator"', 'data."value"'])
      .where('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel: adminLevel });
    if (placeCodes.length) {
      staticIndicatorsScript = staticIndicatorsScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes: placeCodes },
      );
    }
    const staticIndicators = await staticIndicatorsScript.getRawMany();

    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    let dynamicIndicatorsScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select(['area."placeCode"'])
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'dynamic',
        'area.placeCode = dynamic.placeCode',
      )
      .addSelect(['dynamic."indicator"', 'dynamic."value"'])
      .where('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .andWhere('timestamp >= :last6hourInterval', {
        last6hourInterval: this.helperService.getLast6hourInterval(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      })
      .andWhere('"disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel: adminLevel });
    if (placeCodes.length) {
      dynamicIndicatorsScript = dynamicIndicatorsScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes: placeCodes },
      );
    }
    const dynamicIndicators = await dynamicIndicatorsScript.getRawMany();
    return staticIndicators.concat(dynamicIndicators);
  }

  private async getDisasterType(
    disasterType: DisasterType,
  ): Promise<DisasterEntity> {
    return await this.disasterTypeRepository.findOne({
      where: { disasterType: disasterType },
      relations: ['leadTimes'],
    });
  }

  public async getAdminAreasRaw(countryCodeISO3): Promise<any[]> {
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
    leadTime: string,
    adminLevel: number,
    eventName: string,
  ): Promise<GeoJson> {
    const disaster = await this.getDisasterType(disasterType);
    let adminAreasScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select([
        'area."placeCode"',
        'area."name"',
        'ST_AsGeoJSON(area.geom)::json As geom',
        'area."countryCodeISO3"',
      ])
      .where('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel: adminLevel });

    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

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
        `dynamic.value AS ${disaster.actionsUnit}`,
        'dynamic."leadTime"',
        'dynamic."date"',
        'parent.name AS "nameParent"',
      ])
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .andWhere('timestamp >= :last6hourInterval', {
        last6hourInterval: this.helperService.getLast6hourInterval(
          disasterType,
          lastTriggeredDate.timestamp,
        ),
      })
      .andWhere('"disasterType" = :disasterType', {
        disasterType: disasterType,
      })
      .andWhere('dynamic."indicator" = :indicator', {
        indicator: disaster.actionsUnit,
      });

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
        { placeCodes: placeCodes },
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
  ) {
    const lastTriggeredDate = await this.helperService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );
    const adminAreasToShow = await this.adminAreaDynamicDataRepo.find({
      where: {
        countryCodeISO3: countryCodeISO3,
        disasterType: disasterType,
        adminLevel: adminLevel,
        leadTime: leadTime,
        date: lastTriggeredDate.date,
        timestamp: MoreThanOrEqual(
          this.helperService.getLast6hourInterval(
            disasterType,
            lastTriggeredDate.timestamp,
          ),
        ),
        indicator: DynamicIndicator.showAdminArea,
        value: 1,
      },
    });
    return adminAreasToShow.map(area => area.placeCode);
  }
}
