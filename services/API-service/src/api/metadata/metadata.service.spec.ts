import { CountryEntity } from './../country/country.entity';
import { UserEntity } from '../user/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { MetadataService } from './metadata.service';
import { LayerMetadataEntity } from './layer-metadata.entity';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { HelperService } from '../../shared/helper.service';

describe('MetadataService', (): void => {
  let service: MetadataService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            IndicatorMetadataEntity,
            UserEntity,
            LayerMetadataEntity,
            TriggerPerLeadTime,
            CountryEntity,
          ]),
        ],
        providers: [MetadataService, HelperService],
      }).compile();

      service = module.get<MetadataService>(MetadataService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
