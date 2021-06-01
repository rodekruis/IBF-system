import { Injectable } from '@nestjs/common';
import { HelperService } from '../../shared/helper.service';
import { getManager } from 'typeorm';
import { HealthSiteEntity } from './health-site.entity';

@Injectable()
export class HealthSiteService {
  private readonly helperService: HelperService;

  public constructor(helperService: HelperService) {
    this.helperService = helperService;
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

    return this.helperService.toGeojson(queryResult);
  }
}
