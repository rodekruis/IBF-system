import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { MetadataService } from './metadata.service';
import { LayerMetadataEntity } from './layer-metadata.entity';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { HelperService } from '../../shared/helper.service';
import { EventService } from '../event/event.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { repositoryMockFactory } from '../../mock/repositoryMock.factory';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';

describe('MetadataService', (): void => {
  let service: MetadataService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            IndicatorMetadataEntity,
            LayerMetadataEntity,
          ]),
        ],
        providers: [
          MetadataService,
          HelperService,
          EventService,
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
        ],
      }).compile();

      service = module.get<MetadataService>(MetadataService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
