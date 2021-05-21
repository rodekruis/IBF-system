import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { EntityManager, Repository } from 'typeorm';
import fs from 'fs';
import { LeadTime } from '../admin-area-dynamic-data/enum/lead-time.enum';
import { AdminAreaEntity } from './admin-area.entity';
import { CountryEntity } from '../country/country.entity';
import { EventService } from '../event/event.service';
import { AdminAreaRecord } from 'src/shared/data.model';

@Injectable()
export class AdminAreaService {
  @InjectRepository(AdminAreaEntity)
  private readonly adminAreaRepository: Repository<AdminAreaEntity>;

  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  private manager: EntityManager;
  private helperService: HelperService;
  private eventService: EventService;

  public constructor(
    manager: EntityManager,
    helperService: HelperService,
    eventService: EventService,
  ) {
    this.manager = manager;
    this.helperService = helperService;
    this.eventService = eventService;
  }

  public async getAdminAreas(countryCodeISO3): Promise<any[]> {
    return await this.adminAreaRepository.find({
      select: ['countryCodeISO3', 'name', 'placeCode', 'geom'],
      where: { countryCodeISO3: countryCodeISO3 },
    });
  }

  public async getAdminAreasPerLeadTime(
    countryCodeISO3: string,
    leadTime: string,
    adminLevel: number,
  ): Promise<GeoJson> {
    if (!leadTime) {
      leadTime = await this.getDefaultLeadTime(countryCodeISO3);
    }
    const trigger = (
      await this.eventService.getTriggerPerLeadtime(countryCodeISO3)
    )[leadTime];

    let placeCodes;
    if (parseInt(trigger) === 1) {
      placeCodes = (
        await this.eventService.getTriggeredAreas(countryCodeISO3)
      ).map((triggeredArea): string => "'" + triggeredArea.placeCode + "'");
    }

    const baseQuery = fs
      .readFileSync('./src/api/admin-area/sql/get-admin-regions.sql')
      .toString();
    const query = baseQuery.concat(
      placeCodes && placeCodes.length > 0
        ? ' and geo."placeCode" in (' + placeCodes.toString() + ')'
        : '',
    );

    const adminAreas: AdminAreaRecord[] = await this.manager.query(query, [
      countryCodeISO3,
      leadTime,
      adminLevel,
    ]);

    return this.helperService.toGeojson(adminAreas);
  }

  public async getStationAdminAreaMappingByCountry(
    countryCodeISO3,
  ): Promise<any[]> {
    return await this.adminAreaRepository.find({
      select: ['countryCodeISO3', 'name', 'placeCode', 'glofasStation'],
      where: { countryCodeISO3: countryCodeISO3 },
    });
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
