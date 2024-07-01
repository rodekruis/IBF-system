import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { RainfallTriggersEntity } from './rainfall-triggers.entity';

@Injectable()
export class RainfallTriggersService {
  @InjectRepository(RainfallTriggersEntity)
  private readonly rainfallTriggersRepository: Repository<RainfallTriggersEntity>;

  public async getTriggerLevelsByCountry(
    countryCodeISO3,
  ): Promise<RainfallTriggersEntity[]> {
    return await this.rainfallTriggersRepository.find({
      where: { countryCodeISO3: countryCodeISO3 },
    });
  }
}
