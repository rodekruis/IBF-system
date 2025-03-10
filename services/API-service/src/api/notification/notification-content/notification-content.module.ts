import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../../shared/helper.service';
import { AdminAreaDataModule } from '../../admin-area-data/admin-area-data.module';
import { AdminAreaModule } from '../../admin-area/admin-area.module';
import { CountryEntity } from '../../country/country.entity';
import { DisasterTypeEntity } from '../../disaster-type/disaster-type.entity';
import { EventModule } from '../../event/event.module';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
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
  ],
  controllers: [],
  providers: [NotificationContentService, HelperService],
  exports: [NotificationContentService],
})
export class NotificationContentModule {}
