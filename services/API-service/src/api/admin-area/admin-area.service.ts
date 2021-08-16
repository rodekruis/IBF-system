import { CountryService } from './../country/country.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { Repository } from 'typeorm';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaEntity } from './admin-area.entity';
import { CountryEntity } from '../country/country.entity';
import { EventService } from '../event/event.service';
import { AggregateDataRecord } from 'src/shared/data.model';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaDataEntity } from '../admin-area-data/admin-area-data.entity';
import { DisasterType } from '../disaster/disaster-type.enum';
import { DisasterEntity } from '../disaster/disaster.entity';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterTypeRepository: Repository<DisasterEntity>;

  private helperService: HelperService;
  private eventService: EventService;
  private countryService: CountryService;

  public constructor(
    helperService: HelperService,
    eventService: EventService,
    countryService: CountryService,
  ) {
    this.helperService = helperService;
    this.eventService = eventService;
    this.countryService = countryService;
  }

  public async getAdminAreasRaw(countryCodeISO3): Promise<any[]> {
    const country = await this.countryRepository.findOne({
      select: ['defaultAdminLevel'],
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return await this.adminAreaRepository.find({
      select: ['countryCodeISO3', 'name', 'placeCode', 'geom', 'glofasStation'],
      where: {
        countryCodeISO3: countryCodeISO3,
        adminLevel: country.defaultAdminLevel,
      },
    });
  }

  private async getTriggeredPlaceCodes(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
  ) {
    if (leadTime === '{leadTime}') {
      leadTime = await this.getDefaultLeadTime(countryCodeISO3, disasterType);
    }
    const trigger = (
      await this.eventService.getTriggerPerLeadtime(
        countryCodeISO3,
        disasterType,
      )
    )[leadTime];

    let placeCodes = [];
    if (parseInt(trigger) === 1) {
      placeCodes = (
        await this.eventService.getTriggeredAreas(
          countryCodeISO3,
          disasterType,
          leadTime,
        )
      ).map((triggeredArea): string => triggeredArea.placeCode);
    }
    return placeCodes;
  }

  public async getAggregatesData(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
  ): Promise<AggregateDataRecord[]> {
    const placeCodes = await this.getTriggeredPlaceCodes(
      countryCodeISO3,
      disasterType,
      leadTime,
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

  private async getActionUnit(disasterType: DisasterType): Promise<string> {
    return (
      await this.disasterTypeRepository.findOne({
        select: ['actionsUnit'],
        where: { disasterType: disasterType },
      })
    ).actionsUnit;
  }

  public async getAdminAreas(
    countryCodeISO3: string,
    disasterType: DisasterType,
    leadTime: string,
    adminLevel: number,
  ): Promise<GeoJson> {
    const actionUnit = await this.getActionUnit(disasterType);
    const country = await this.countryRepository.findOne({
      select: ['defaultAdminLevel'],
      where: { countryCodeISO3: countryCodeISO3 },
    });
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
    // Only add triggered-area filter if this is the default admin level
    if (adminLevel == country.defaultAdminLevel) {
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
          `dynamic.value AS ${actionUnit}`,
          'dynamic."leadTime"',
          'dynamic."date"',
        ])
        .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
        .andWhere('date = :lastTriggeredDate', {
          lastTriggeredDate: lastTriggeredDate.date,
        })
        .andWhere('"disasterType" = :disasterType', {
          disasterType: disasterType,
        })
        .andWhere('dynamic."indicator" = :indicator', {
          indicator: actionUnit,
        });

      const placeCodes = await this.getTriggeredPlaceCodes(
        countryCodeISO3,
        disasterType,
        leadTime,
      );

      if (
        placeCodes.length &&
        disasterType !== DisasterType.Dengue &&
        disasterType !== DisasterType.Malaria &&
        disasterType !== DisasterType.Drought
      ) {
        adminAreasScript = adminAreasScript.andWhere(
          'area."placeCode" IN (:...placeCodes)',
          { placeCodes: placeCodes },
        );
      }
    } else {
      adminAreasScript = adminAreasScript.addSelect(`null AS ${actionUnit}`);
    }
    const adminAreas = await adminAreasScript.getRawMany();

    return this.helperService.toGeojson(adminAreas);
  }

  private async getDefaultLeadTime(
    countryCodeISO3: string,
    disasterType: DisasterType,
  ): Promise<string> {
    const country = await this.countryRepository.findOne({
      where: { countryCodeISO3: countryCodeISO3 },
      relations: ['countryActiveLeadTimes'],
    });
    const countryLeadTimes = country.countryActiveLeadTimes.map(
      l => l.leadTimeName,
    );
    const disaster = await this.disasterTypeRepository.findOne({
      where: { disasterType: disasterType },
      relations: ['leadTimes'],
    });
    const disasterLeadTimes = disaster.leadTimes.map(l => l.leadTimeName);

    // Intersection of country- and disaster-leadTimes
    const leadTimes = countryLeadTimes.filter(leadTime =>
      disasterLeadTimes.includes(leadTime),
    );

    if (leadTimes.includes(LeadTime.day7)) {
      return LeadTime.day7;
    } else if (leadTimes.includes(LeadTime.month0)) {
      return LeadTime.month0;
    } else {
      return countryLeadTimes[0];
    }
  }
}
