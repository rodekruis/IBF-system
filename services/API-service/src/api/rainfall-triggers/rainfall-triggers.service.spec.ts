import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { RainfallTriggersEntity } from './rainfall-triggers.entity';
import { RainfallTriggersService } from './rainfall-triggers.service';

describe('RainfallTriggersService', (): void => {
  let service: RainfallTriggersService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RainfallTriggersService,
          {
            provide: getRepositoryToken(RainfallTriggersEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<RainfallTriggersService>(RainfallTriggersService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
