import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAreaDataModule } from '../../admin-area-data/admin-area-data.module';
import { AdminAreaDynamicDataModule } from '../../admin-area-dynamic-data/admin-area-dynamic-data.module';
import { AdminAreaModule } from '../../admin-area/admin-area.module';
import { CountryEntity } from '../../country/country.entity';
import { DisasterEntity } from '../../disaster/disaster.entity';
import { EventModule } from '../../event/event.module';
import { IndicatorMetadataEntity } from '../../metadata/indicator-metadata.entity';
import { NotificationContentService } from './notification-content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryEntity,
      IndicatorMetadataEntity,
      DisasterEntity,
    ]),
    EventModule,
    AdminAreaDynamicDataModule,
    AdminAreaDataModule,
    AdminAreaModule,
  ],
  controllers: [],
  providers: [NotificationContentService],
  exports: [NotificationContentService],
})
export class NotificationContentModule {}
