import { CountryService } from './../country/country.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AdminAreaDataEntity } from './admin-area-data.entity';
import { AdminAreaDataService } from './admin-area-data.service';
import { CountryEntity } from '../country/country.entity';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';

describe('AdminAreaDataService', (): void => {
  let service: AdminAreaDataService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([AdminAreaDataEntity]),
        ],
        providers: [
          AdminAreaDataService,
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
