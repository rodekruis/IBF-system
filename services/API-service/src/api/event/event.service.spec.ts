import { EventService } from './event.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { CountryService } from '../country/country.service';
import { CountryEntity } from '../country/country.entity';

describe('Event service', (): void => {
  let service: EventService;
  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
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
            provide: getRepositoryToken(CountryEntity),
            useFactory: repositoryMockFactory,
          },
          EventService,
          CountryService,
        ],
      }).compile();

      service = module.get<EventService>(EventService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
