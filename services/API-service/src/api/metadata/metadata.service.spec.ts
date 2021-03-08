import { UserEntity } from '../user/user.entity';
import { DataService } from '../data/data.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataModule } from '../data/data.module';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { MetadataService } from './metadata.service';
import { LayerMetadataEntity } from './layer-metadata.entity';

describe('MetadataService', (): void => {
  let service: MetadataService;

  beforeEach(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          DataModule,
          TypeOrmModule.forRoot(),
          TypeOrmModule.forFeature([
            IndicatorMetadataEntity,
            UserEntity,
            LayerMetadataEntity,
          ]),
        ],
        providers: [MetadataService, DataService],
      }).compile();

      service = module.get<MetadataService>(MetadataService);
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
