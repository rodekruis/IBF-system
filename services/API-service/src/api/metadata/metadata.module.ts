import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MetadataController } from './metadata.controller';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { MetadataService } from './metadata.service';
import { LayerMetadataEntity } from './layer-metadata.entity';
import { HelperService } from '../../shared/helper.service';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([IndicatorMetadataEntity, LayerMetadataEntity]),
    EventModule,
  ],
  providers: [MetadataService, HelperService],
  controllers: [MetadataController],
  exports: [MetadataService],
})
export class MetadataModule {}
