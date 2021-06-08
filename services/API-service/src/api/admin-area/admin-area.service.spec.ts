import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
        providers: [
          AdminAreaService,
          EventService,
          HelperService,
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
          {
            provide: getRepositoryToken(AdminAreaEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(CountryEntity),
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
