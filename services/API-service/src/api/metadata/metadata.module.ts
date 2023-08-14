import { CountryModule } from './../country/country.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MetadataController } from './metadata.controller';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { MetadataService } from './metadata.service';
import { LayerMetadataEntity } from './layer-metadata.entity';
import { HelperService } from '../../shared/helper.service';
import { EventModule } from '../event/event.module';
import { DisasterEntity } from '../disaster/disaster.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      IndicatorMetadataEntity,
      LayerMetadataEntity,
      DisasterEntity,
    ]),
    CountryModule,
    EventModule,
  ],
  providers: [MetadataService, HelperService],
  controllers: [MetadataController],
  exports: [MetadataService],
})
export class MetadataModule {}
