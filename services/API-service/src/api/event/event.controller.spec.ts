import { CountryService } from './../country/country.service';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { EventService } from './event.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { UserService } from '../user/user.service';
import { CountryEntity } from '../country/country.entity';

describe('EventController', (): void => {
  let controller: EventController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [EventController],
        providers: [
          EventService,
          CountryService,
          UserService,
          {
            provide: getRepositoryToken(UserEntity),
            useFactory: repositoryMockFactory,
          },
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
        ],
      }).compile();

      controller = module.get<EventController>(EventController);
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
