import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from './country.entity';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;

  public async getCountries(): Promise<CountryEntity[]> {
    return this.countryRepository.find();
  }
}
