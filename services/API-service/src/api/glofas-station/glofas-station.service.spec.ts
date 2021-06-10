import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { HelperService } from '../../shared/helper.service';
import { GlofasStationForecastEntity } from './glofas-station-forecast.entity';
import { GlofasStationEntity } from './glofas-station.entity';
import { GlofasStationService } from './glofas-station.service';

describe('GlofasStationService', (): void => {
  let service: GlofasStationService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GlofasStationService,
          HelperService,
          {
            provide: getRepositoryToken(GlofasStationEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(GlofasStationForecastEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<GlofasStationService>(GlofasStationService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
