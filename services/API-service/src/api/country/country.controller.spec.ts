import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { CountryController } from './country.controller';
import { CountryEntity } from './country.entity';
import { CountryService } from './country.service';

describe('CountryController', (): void => {
  let controller: CountryController;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CountryController],
        providers: [
          UserService,
          CountryService,
          {
            provide: getRepositoryToken(UserEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(CountryEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      controller = module.get<CountryController>(CountryController);
    },
  );

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });
});
