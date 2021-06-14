import { WaterpointsService } from './waterpoints.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { CountryService } from '../country/country.service';
import { CountryEntity } from '../country/country.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';

describe('Waterpoints service', (): void => {
  let service: WaterpointsService;

  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [
          WaterpointsService,
          CountryService,
          {
            provide: getRepositoryToken(CountryEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<WaterpointsService>(WaterpointsService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
