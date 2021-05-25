import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisasterType } from '../disaster/disaster-type.enum';
import { CountryEntity } from './country.entity';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  private readonly relations: string[] = [
    'countryActiveLeadTimes',
    'disasterTypes',
    'disasterTypes.leadTimes',
  ];

  public async findAll(): Promise<CountryEntity[]> {
    return await this.countryRepository.find({
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

  public async getTriggerUnitsForCountry(
    countryCodeISO3: string,
  ): Promise<string[]> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };
    const country = await this.countryRepository.findOne(findOneOptions, {
      relations: ['disasterTypes'],
    });
    const triggerUnits = [];
    for (const disaster of country.disasterTypes) {
      triggerUnits.push(disaster.triggerUnit);
    }
    return triggerUnits;
  }

  public async getDisasterTypesForCountry(
    countryCodeISO3,
  ): Promise<DisasterType[]> {
    const findOneOptions = {
      countryCodeISO3: countryCodeISO3,
    };
    const country = await this.countryRepository.findOne(findOneOptions, {
      relations: ['disasterTypes'],
    });
    const disasterTypes: DisasterType[] = [];
    for (const disaster of country.disasterTypes) {
      disasterTypes.push(disaster.disasterType);
    }
    return disasterTypes;
  }
}
