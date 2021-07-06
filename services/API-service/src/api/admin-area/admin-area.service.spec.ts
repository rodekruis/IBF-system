import { AreaOfFocusEntity } from './../eap-actions/area-of-focus.entity';
import { UserEntity } from './../user/user.entity';
import { CountryService } from './../country/country.service';
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
import { EapActionsService } from '../eap-actions/eap-actions.service';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { EapActionEntity } from '../eap-actions/eap-action.entity';
import { DisasterEntity } from '../disaster/disaster.entity';

describe('AdminAreaService', (): void => {
  let service: AdminAreaService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminAreaService,
          EapActionsService,
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
          {
            provide: getRepositoryToken(AdminAreaEntity),
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
            provide: getRepositoryToken(DisasterEntity),
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
