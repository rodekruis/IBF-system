import { CountryEntity } from './../country/country.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapActionsService } from './eap-actions.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';

describe('EapActionsService', (): void => {
  let service: EapActionsService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EapActionsService,
          {
            provide: getRepositoryToken(UserEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(EapActionEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(EapActionStatusEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(AreaOfFocusEntity),
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
            provide: getRepositoryToken(AdminAreaEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<EapActionsService>(EapActionsService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
