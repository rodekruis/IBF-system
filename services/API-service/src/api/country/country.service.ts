import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from './country.entity';

@Injectable()
export class CountryService {
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  private readonly relations: string[] = ['countryLeadTimes'];

  public async getCountries(): Promise<CountryEntity[]> {
    return await this.countryRepository.find({
      relations: this.relations,
    });
  }
}
