import { DataService } from './data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../mock/repositoryMock.factory';

describe('User service', (): void => {
  let service: DataService;
  let module: TestingModule;

  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DataService,
          {
            provide: getRepositoryToken(DataEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(UserEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<DataService>(DataService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
