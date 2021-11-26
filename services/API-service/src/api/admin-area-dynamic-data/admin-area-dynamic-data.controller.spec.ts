import { AdminAreaDynamicDataService } from './admin-area-dynamic-data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAreaDynamicDataController } from './admin-area-dynamic-data.controller';
import { CountryService } from '../country/country.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from './admin-area-dynamic-data.entity';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { EventService } from '../event/event.service';
import { CountryEntity } from '../country/country.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { EapActionsService } from '../eap-actions/eap-actions.service';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { EapActionEntity } from '../eap-actions/eap-action.entity';
import { AreaOfFocusEntity } from '../eap-actions/area-of-focus.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { HelperService } from '../../shared/helper.service';

describe('AdminAreaDynamicController', (): void => {
  let controller: AdminAreaDynamicDataController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AdminAreaDynamicDataController],
        providers: [
          AdminAreaDynamicDataService,
          CountryService,
          UserService,
          EventService,
          HelperService,
          EapActionsService,
          {
            provide: getRepositoryToken(AdminAreaDynamicDataEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(UserEntity),
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
            provide: getRepositoryToken(EventPlaceCodeEntity),
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

      controller = module.get<AdminAreaDynamicDataController>(
        AdminAreaDynamicDataController,
      );
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
