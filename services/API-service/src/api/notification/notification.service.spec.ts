import { AdminAreaDynamicDataEntity } from './../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { AdminAreaDynamicDataService } from '../admin-area-dynamic-data/admin-area-dynamic-data.service';
import { CountryEntity } from '../country/country.entity';
import { CountryService } from '../country/country.service';
import { AreaOfFocusEntity } from '../eap-actions/area-of-focus.entity';
import { EapActionStatusEntity } from '../eap-actions/eap-action-status.entity';
import { EapActionEntity } from '../eap-actions/eap-action.entity';
import { EapActionsService } from '../eap-actions/eap-actions.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { EventService } from '../event/event.service';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { UserEntity } from '../user/user.entity';
import { NotificationService } from './notification.service';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { HelperService } from '../../shared/helper.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
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
          provide: getRepositoryToken(IndicatorMetadataEntity),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(AdminAreaDynamicDataEntity),
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
        NotificationService,
        AdminAreaDynamicDataService,
        HelperService,
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
