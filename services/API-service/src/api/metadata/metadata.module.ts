import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { CountryModule } from './../country/country.module';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([
      IndicatorMetadataEntity,
      LayerMetadataEntity,
      DisasterTypeEntity,
    ]),
    CountryModule,
    EventModule,
  ],
  providers: [MetadataService, HelperService],
  controllers: [MetadataController],
  exports: [MetadataService],
})
export class MetadataModule {}
