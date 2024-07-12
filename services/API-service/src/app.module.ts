import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AdminAreaDataModule } from './api/admin-area-data/admin-area-data.module';
import { AdminAreaDynamicDataModule } from './api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { AdminAreaModule } from './api/admin-area/admin-area.module';
import { CountryModule } from './api/country/country.module';
import { DisasterModule } from './api/disaster/disaster.module';
import { EapActionsModule } from './api/eap-actions/eap-actions.module';
import { EventModule } from './api/event/event.module';
import { GlofasStationModule } from './api/glofas-station/glofas-station.module';
import { LinesDataModule } from './api/lines-data/lines-data.module';
import { MetadataModule } from './api/metadata/metadata.module';
import { NotificationModule } from './api/notification/notification.module';
import { WhatsappModule } from './api/notification/whatsapp/whatsapp.module';
import { PointDataModule } from './api/point-data/point-data.module';
import { RainfallTriggersModule } from './api/rainfall-triggers/rainfall-triggers.module';
import { TyphoonTrackModule } from './api/typhoon-track/typhoon-track.module';
import { UserModule } from './api/user/user.module';
import { WaterpointsModule } from './api/waterpoints/waterpoints.module';
import { AppController } from './app.controller';
import { CronjobModule } from './cronjob/cronjob.module';
import { HealthModule } from './health.module';
import { ScriptsModule } from './scripts/scripts.module';
import { TypeOrmModule } from './typeorm.module';

@Module({
  imports: [
    TypeOrmModule,
    EapActionsModule,
    WaterpointsModule,
    ScriptsModule,
    HealthModule,
    CountryModule,
    EventModule,
    MetadataModule,
    AdminAreaModule,
    GlofasStationModule,
    AdminAreaDynamicDataModule,
    DisasterModule,
    AdminAreaDataModule,
    RainfallTriggersModule,
    TyphoonTrackModule,
    NotificationModule,
    UserModule,
    WhatsappModule,
    CronjobModule,
    ScheduleModule.forRoot(),
    PointDataModule,
    LinesDataModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {}
