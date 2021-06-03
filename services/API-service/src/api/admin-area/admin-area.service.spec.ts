import { CountryService } from './../country/country.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { HelperService } from '../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { CountryEntity } from '../country/country.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { EventService } from '../event/event.service';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { AdminAreaEntity } from './admin-area.entity';
import { AdminAreaService } from './admin-area.service';

describe('AdminAreaService', (): void => {
  let service: AdminAreaService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([AdminAreaEntity, CountryEntity]),
        ],
        providers: [
          AdminAreaService,
          EventService,
          HelperService,
          CountryService,
          {
            provide: getRepositoryToken(EventPlaceCodeEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(AdminAreaDynamicDataEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(TriggerPerLeadTime),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<AdminAreaService>(AdminAreaService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
