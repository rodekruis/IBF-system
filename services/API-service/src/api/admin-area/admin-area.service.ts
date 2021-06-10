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

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

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
    return await this.adminAreaRepository.find({
      select: ['countryCodeISO3', 'name', 'placeCode', 'geom', 'glofasStation'],
      where: { countryCodeISO3: countryCodeISO3 },
    });
  }

  private async getTriggeredPlaceCodes(
    countryCodeISO3: string,
    leadTime: string,
  ) {
    if (!leadTime) {
      leadTime = await this.getDefaultLeadTime(countryCodeISO3);
    }
    const trigger = (
      await this.eventService.getTriggerPerLeadtime(countryCodeISO3)
    )[leadTime];

    let placeCodes = [];
    if (parseInt(trigger) === 1) {
      placeCodes = (
        await this.eventService.getTriggeredAreas(countryCodeISO3)
      ).map((triggeredArea): string => triggeredArea.placeCode);
    }
    return placeCodes;
  }

  public async getAggregatesData(
    countryCodeISO3: string,
    leadTime: string,
    adminLevel: number,
  ): Promise<AggregateDataRecord[]> {
    const placeCodes = await this.getTriggeredPlaceCodes(
      countryCodeISO3,
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
      .andWhere('date = current_date')
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
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

  public async getAdminAreas(
    countryCodeISO3: string,
    leadTime: string,
    adminLevel: number,
  ): Promise<GeoJson> {
    const placeCodes = await this.getTriggeredPlaceCodes(
      countryCodeISO3,
      leadTime,
    );
    const actionUnits = await this.countryService.getActionsUnitsForCountry(
      countryCodeISO3,
    );
    let adminAreasScript = this.adminAreaRepository
      .createQueryBuilder('area')
      .select([
        'area."placeCode"',
        'area."name"',
        'ST_AsGeoJSON(area.geom)::json As geom',
        'area."countryCodeISO3"',
      ])
      .leftJoin(
        AdminAreaDynamicDataEntity,
        'dynamic',
        'area.placeCode = dynamic.placeCode',
      )
      .addSelect([
        `dynamic.value AS ${actionUnits[0]}`,
        'dynamic."leadTime"',
        'dynamic."date"',
      ])
      .where('area."countryCodeISO3" = :countryCodeISO3', {
        countryCodeISO3: countryCodeISO3,
      })
      .andWhere('dynamic."leadTime" = :leadTime', { leadTime: leadTime })
      .andWhere('area."adminLevel" = :adminLevel', { adminLevel: adminLevel })
      .andWhere('dynamic."indicator" = :indicator', {
        indicator: actionUnits[0],
      });

    const country = await this.countryRepository.findOne({
      select: ['defaultAdminLevel'],
      where: { countryCodeISO3: countryCodeISO3 },
    });
    // Only add triggered-area filter if this is the default admin level
    if (
      placeCodes.length &&
      adminLevel == country.defaultAdminLevel &&
      countryCodeISO3 !== 'PHL'
    ) {
      adminAreasScript = adminAreasScript.andWhere(
        'area."placeCode" IN (:...placeCodes)',
        { placeCodes: placeCodes },
      );
    }

    const adminAreas = await adminAreasScript.getRawMany();

    return this.helperService.toGeojson(adminAreas);
  }

  private async getDefaultLeadTime(countryCodeISO3: string): Promise<string> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };
    const country = await this.countryRepository.findOne(findOneOptions, {
      relations: ['countryActiveLeadTimes'],
    });
    for (const activeLeadTime of country.countryActiveLeadTimes) {
      if (activeLeadTime.leadTimeName === LeadTime.day7) {
        return activeLeadTime.leadTimeName;
      }
    }
    for (const activeLeadTime of country.countryActiveLeadTimes) {
      if (activeLeadTime.leadTimeName === LeadTime.month0) {
        return activeLeadTime.leadTimeName;
      }
    }
    // If country does not have 7 day or 1 month lead time return the first
    return country.countryActiveLeadTimes[0].leadTimeName;
  }
}
