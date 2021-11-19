import { AreaOfFocusEntity } from './../eap-actions/area-of-focus.entity';
import { UserEntity } from './../user/user.entity';
import { EventService } from './event.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { CountryService } from '../country/country.service';
import { CountryEntity } from '../country/country.entity';
import { EapActionsService } from '../eap-actions/eap-actions.service';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { EapActionEntity } from '../eap-actions/eap-action.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { HelperService } from '../../shared/helper.service';

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
          {
            provide: getRepositoryToken(UserEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(EapActionStatusEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(EapActionEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(AreaOfFocusEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(AdminAreaEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(DisasterEntity),
            useFactory: repositoryMockFactory,
          },
          EventService,
          CountryService,
          EapActionsService,
          HelperService,
        ],
      }).compile();

      service = module.get<EventService>(EventService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
