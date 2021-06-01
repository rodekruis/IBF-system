import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJson } from '../../shared/geo.model';
import { HelperService } from '../../shared/helper.service';
import { Repository } from 'typeorm';
import { RedcrossBranchEntity } from './redcross-branch.entity';

@Injectable()
export class RedcrossBranchService {
  @InjectRepository(RedcrossBranchEntity)
  private readonly redcrossBranchRepository: Repository<RedcrossBranchEntity>;

  private readonly helperService: HelperService;

  public constructor(helperService: HelperService) {
    this.helperService = helperService;
  }

  public async getBranchesByCountry(countryCodeISO3): Promise<GeoJson> {
    const branches = await this.redcrossBranchRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
    return this.helperService.toGeojson(branches);
  }
}
