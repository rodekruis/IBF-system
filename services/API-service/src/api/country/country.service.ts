import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CountryEntity } from './country.entity';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  private readonly relations: string[] = [
    'countryDisasterSettings',
    'countryDisasterSettings.activeLeadTimes',
    'disasterTypes',
    'disasterTypes.leadTimes',
  ];

  public async getAllCountries(): Promise<CountryEntity[]> {
    return await this.countryRepository.find({
      relations: this.relations,
    });
  }

  public async getCountries(
    countryCodesISO3?: string,
  ): Promise<CountryEntity[]> {
    const countryCodes = countryCodesISO3.split(',');
    return await this.countryRepository.find({
      where: { countryCodeISO3: In(countryCodes) },
      relations: this.relations,
    });
  }

  public async findOne(countryCodeISO3: string): Promise<CountryEntity> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };

    return await this.countryRepository.findOne(findOneOptions, {
      relations: this.relations,
    });
  }
}
