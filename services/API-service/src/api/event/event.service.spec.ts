import { EventPcodeEntity } from './event-pcode.entity';
import { EventService } from './event.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';

describe('User service', (): void => {
  let service: EventService;
  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: getRepositoryToken(EventPcodeEntity),
            useFactory: repositoryMockFactory,
          },
          EventService,
        ],
      }).compile();

      service = module.get<EventService>(EventService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
