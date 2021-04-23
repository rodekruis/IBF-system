import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { DataService } from '../data/data.service';
import { GeoJson, GeoJsonFeature } from '../data/geo.model';
import { HealthSiteEntity } from './health-site.entity';

@Injectable()
export class HealthSiteService {
  private readonly dataService: DataService;

  public constructor(dataService: DataService) {
    this.dataService = dataService;
  }

  public async getHealthSitesCountry(countryCodeISO3: string): Promise<any> {
    const queryResult = await getManager()
      .createQueryBuilder()
      // convert geometry result into GeoJSON, treated as JSON (so that TypeORM
      // will know to deserialize it)
      .select('name, type, ST_AsGeoJSON(geom)::json geom')
      .from(HealthSiteEntity, 'healthSiteEntity')
      .where('healthSiteEntity.countryCodeISO3 = :countryCodeISO3', {
        countryCodeISO3,
      })
      .getRawMany();

    return this.dataService.toGeojson(queryResult);
  }
}
