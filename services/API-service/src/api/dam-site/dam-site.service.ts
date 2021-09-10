import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { DamSiteEntity } from './dam-site.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';

@Injectable()
export class DamSiteService {
  @InjectRepository(DamSiteEntity)
  private readonly damSiteRepository: Repository<DamSiteEntity>;
  private readonly helperService: HelperService;
  public constructor(helperService: HelperService) {
    this.helperService = helperService;
  }

  public async getDamSitesByCountry(countryCodeISO3): Promise<GeoJson> {
    const damSites = await this.damSiteRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return this.helperService.toGeojson(damSites);
  }
}
