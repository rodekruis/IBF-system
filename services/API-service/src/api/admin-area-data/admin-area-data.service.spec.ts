import { CountryService } from './../country/country.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import { AdminAreaDataService } from './admin-area-data.service';
import { CountryEntity } from '../country/country.entity';
import { HelperService } from '../../shared/helper.service';

describe('AdminAreaDataService', (): void => {
  let service: AdminAreaDataService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminAreaDataService,
          {
            provide: getRepositoryToken(AdminAreaDataEntity),
            useFactory: repositoryMockFactory,
          },
          AdminAreaDataService,
          HelperService,
          CountryService,
          {
            provide: getRepositoryToken(CountryEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<AdminAreaDataService>(AdminAreaDataService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
