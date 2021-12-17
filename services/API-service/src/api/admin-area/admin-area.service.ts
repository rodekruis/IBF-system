import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaEntity } from './admin-area.entity';
import { CountryEntity } from '../country/country.entity';
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
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
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

  private async getTriggeredPlaceCodes(
    countryCodeISO3: string,
    disasterType: DisasterType,
    adminLevel: number,
    leadTime: string,
    eventName: string,
  ) {
    if (leadTime === '{leadTime}') {
      leadTime = await this.getDefaultLeadTime(countryCodeISO3, disasterType);
    }
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
    const lastTriggeredDate = await this.eventService.getRecentDate(
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
          this.helperService.getLast12hourInterval(
            disasterType,
            lastTriggeredDate.timestamp,
          ),
        ),
      },
    });
  }

  public async getAggregatesData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
    eventName: string,
  ): Promise<AggregateDataRecord[]> {
    const disaster = await this.getDisasterType(disasterType);
    let placeCodes = [];
    // For these disaster-types show only triggered areas. For others show all.
    if (
      [DisasterType.Floods, DisasterType.HeavyRain].includes(
        disaster.disasterType,
      )
    ) {
      placeCodes = await this.getTriggeredPlaceCodes(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
        eventName,
      );
    }

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

    const lastTriggeredDate = await this.eventService.getRecentDate(
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
      .andWhere('timestamp >= :last12hourInterval', {
        last12hourInterval: this.helperService.getLast12hourInterval(
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

    const lastTriggeredDate = await this.eventService.getRecentDate(
      countryCodeISO3,
      disasterType,
    );

    adminAreasScript = adminAreasScript
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'dynamic',
        'area.placeCode = dynamic.placeCode',
      )
      .addSelect([
        `dynamic.value AS ${disaster.actionsUnit}`,
        'dynamic."leadTime"',
        'dynamic."date"',
      ])
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
      .andWhere('date = :lastTriggeredDate', {
        lastTriggeredDate: lastTriggeredDate.date,
      })
      .andWhere('timestamp >= :last12hourInterval', {
        last12hourInterval: this.helperService.getLast12hourInterval(
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

    // For these disaster-types show only triggered areas. For others show all.
    if (
      [DisasterType.Floods, DisasterType.HeavyRain].includes(
        disaster.disasterType,
      )
    ) {
      const placeCodes = await this.getTriggeredPlaceCodes(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
        eventName,
      );
      if (placeCodes.length) {
        adminAreasScript = adminAreasScript.andWhere(
          'area."placeCode" IN (:...placeCodes)',
          { placeCodes: placeCodes },
        );
      }
    } else {
      const placeCodesToShow = await this.getPlaceCodesToShow(
        countryCodeISO3,
        disasterType,
        adminLevel,
        leadTime,
      );
      if (placeCodesToShow.length) {
        adminAreasScript = adminAreasScript.andWhere(
          'area."placeCode" IN (:...placeCodes)',
          { placeCodes: placeCodesToShow },
        );
      }
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
    if (leadTime === '{leadTime}') {
      leadTime = await this.getDefaultLeadTime(countryCodeISO3, disasterType);
    }
    const lastTriggeredDate = await this.eventService.getRecentDate(
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
          this.helperService.getLast12hourInterval(
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

  private async getDefaultLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<string> {
    const country = await this.countryRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3 },
      relations: [
        'countryDisasterSettings',
        'countryDisasterSettings.activeLeadTimes',
      ],
    });
    const leadTimes = country.countryDisasterSettings
      .find(s => s.disasterType === disasterType)
      .activeLeadTimes.map(l => l.leadTimeName);

    if (leadTimes.includes(LeadTime.day7)) {
      return LeadTime.day7;
    } else if (leadTimes.includes(LeadTime.month0)) {
      return LeadTime.month0;
    } else {
      return leadTimes[0];
    }
  }
}
