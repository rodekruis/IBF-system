import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../../shared/helper.service';
import { AdminAreaDataModule } from '../../admin-area-data/admin-area-data.module';
import { AdminAreaModule } from '../../admin-area/admin-area.module';
import { CountryEntity } from '../../country/country.entity';
import { DisasterTypeEntity } from '../../disaster-type/disaster-type.entity';
import { DisasterTypeModule } from '../../disaster-type/disaster-type.module';
import { EventModule } from '../../event/event.module';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { MetadataModule } from '../../metadata/metadata.module';
import { NotificationContentService } from './notification-content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryEntity,
      IndicatorMetadataEntity,
      DisasterTypeEntity,
    ]),
    EventModule,
    AdminAreaDataModule,
    AdminAreaModule,
    DisasterTypeModule,
    MetadataModule,
  ],
  controllers: [],
  providers: [NotificationContentService, HelperService],
  exports: [NotificationContentService],
})
export class NotificationContentModule {}
