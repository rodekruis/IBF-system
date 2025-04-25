import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AdminAreaModule } from './api/admin-area/admin-area.module';
import { AdminAreaDataModule } from './api/admin-area-data/admin-area-data.module';
import { AdminAreaDynamicDataModule } from './api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { CountryModule } from './api/country/country.module';
import { DisasterTypeModule } from './api/disaster-type/disaster-type.module';
import { EapActionsModule } from './api/eap-actions/eap-actions.module';
import { EventModule } from './api/event/event.module';
import { LinesDataModule } from './api/lines-data/lines-data.module';
import { MetadataModule } from './api/metadata/metadata.module';
import { NotificationModule } from './api/notification/notification.module';
import { WhatsappModule } from './api/notification/whatsapp/whatsapp.module';
import { PointDataModule } from './api/point-data/point-data.module';
import { ProcessEventsModule } from './api/process-events/process-events.module';
import { TyphoonTrackModule } from './api/typhoon-track/typhoon-track.module';
import { UserModule } from './api/user/user.module';
import { WaterpointsModule } from './api/waterpoints/waterpoints.module';
import { AppController } from './app.controller';
import { CronjobModule } from './cronjob/cronjob.module';
import { HealthModule } from './health.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
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
    ProcessEventsModule,
    MetadataModule,
    AdminAreaModule,
    AdminAreaDynamicDataModule,
    DisasterTypeModule,
    AdminAreaDataModule,
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
export class ApplicationModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
