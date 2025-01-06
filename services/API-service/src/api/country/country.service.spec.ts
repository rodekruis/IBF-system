import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import countries from '../../scripts/json/countries.json';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LeadTimeEntity } from '../lead-time/lead-time.entity';
import { NotificationInfoEntity } from '../notification/notifcation-info.entity';
import { CountryDisasterSettingsEntity } from './country-disaster.entity';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

describe('CountryService', () => {
  let service: CountryService;
  let countryRepository: Repository<CountryEntity>;

  const relations = [
    'countryDisasterSettings',
    'countryDisasterSettings.activeLeadTimes',
    'disasterTypes',
    'notificationInfo',
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: getRepositoryToken(CountryEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DisasterEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CountryDisasterSettingsEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(LeadTimeEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(NotificationInfoEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
    countryRepository = module.get<Repository<CountryEntity>>(
      getRepositoryToken(CountryEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCountries', () => {
    it('should return an array of countries', async () => {
      const result = [new CountryEntity()];
      jest.spyOn(countryRepository, 'find').mockResolvedValue(result);

      expect(await service.getCountries()).toBe(result);
      expect(countryRepository.find).toHaveBeenCalledWith({ relations });
    });

    it('should return an array of countries with specific country codes', async () => {
      const countryCodes = countries
        .map((country) => country.countryCodeISO3)
        .join(',');
      const result = [new CountryEntity()];
      jest.spyOn(countryRepository, 'find').mockResolvedValue(result);

      expect(await service.getCountries(countryCodes)).toBe(result);
      expect(countryRepository.find).toHaveBeenCalledWith({
        where: { countryCodeISO3: In(countryCodes.split(',')) },
        relations,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single country with default relations', async () => {
      const countryCodeISO3 = countries[0].countryCodeISO3;
      const result = new CountryEntity();
      jest.spyOn(countryRepository, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(countryCodeISO3)).toBe(result);
      expect(countryRepository.findOne).toHaveBeenCalledWith({
        where: { countryCodeISO3 },
        relations,
      });
    });

    it('should return a single country with custom relations', async () => {
      const countryCodeISO3 = countries[0].countryCodeISO3;
      const customRelations = relations.slice(0, 2);
      const result = new CountryEntity();
      jest.spyOn(countryRepository, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(countryCodeISO3, customRelations)).toBe(
        result,
      );
      expect(countryRepository.findOne).toHaveBeenCalledWith({
        where: { countryCodeISO3 },
        relations: customRelations,
      });
    });
  });
});
