import { AdminAreaDynamicDataModule } from './../admin-area-dynamic-data/admin-area-dynamic-data.module';
import { NotificationInfoEntity } from './notifcation-info.entity';
import { CountryEntity } from './../country/country.entity';
import { EventModule } from './../event/event.module';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorMetadataEntity } from '../metadata/indicator-metadata.entity';
import { DisasterEntity } from '../disaster/disaster.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryEntity,
      NotificationInfoEntity,
      IndicatorMetadataEntity,
      DisasterEntity,
    ]),
    UserModule,
    EventModule,
    AdminAreaDynamicDataModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
