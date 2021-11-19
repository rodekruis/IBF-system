import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { HelperService } from '../../shared/helper.service';
import { EventService } from '../event/event.service';
import { TyphoonTrackEntity } from './typhoon-track.entity';
import { TyphoonTrackService } from './typhoon-track.service';

describe('TyphoonTrackService', (): void => {
  let service: TyphoonTrackService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TyphoonTrackService,
          HelperService,
          EventService,
          {
            provide: getRepositoryToken(TyphoonTrackEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<TyphoonTrackService>(TyphoonTrackService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
