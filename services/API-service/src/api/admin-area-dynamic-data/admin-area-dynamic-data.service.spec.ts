import { AreaOfFocusEntity } from './../eap-actions/area-of-focus.entity';
import { EapActionsService } from './../eap-actions/eap-actions.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { EventService } from '../event/event.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { CountryEntity } from '../country/country.entity';
import { CountryService } from '../country/country.service';
import { UserEntity } from '../user/user.entity';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { EapActionEntity } from '../eap-actions/eap-action.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { HelperService } from '../../shared/helper.service';

describe('AdminAreaDynamicDataService', (): void => {
  let service: AdminAreaDynamicDataService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminAreaDynamicDataService,
          EventService,
          EapActionsService,
          HelperService,
          CountryService,
          {
            provide: getRepositoryToken(CountryEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(AdminAreaDynamicDataEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(EventPlaceCodeEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(TriggerPerLeadTime),
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
        ],
      }).compile();

      service = module.get<AdminAreaDynamicDataService>(
        AdminAreaDynamicDataService,
      );
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
