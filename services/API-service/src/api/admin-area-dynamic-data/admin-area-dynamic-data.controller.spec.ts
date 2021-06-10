import { EventModule } from '../event/event.module';
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
