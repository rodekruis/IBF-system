import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { HealthModule } from './health.module';
import { EapActionsModule } from './api/eap-actions/eap-actions.module';
import { ScriptsModule } from './scripts/scripts.module';
import { CountryModule } from './api/country/country.module';
import { WaterpointsModule } from './api/waterpoints/waterpoints.module';
import { EventModule } from './api/event/event.module';
import { MetadataModule } from './api/metadata/metadata.module';
import { AdminAreaModule } from './api/admin-area/admin-area.module';
import { GlofasStationModule } from './api/glofas-station/glofas-station.module';
import { AdminAreaDynamicDataModule } from './api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { DisasterModule } from './api/disaster/disaster.module';
import { RedcrossBranchModule } from './api/redcross-branch/redcross-branch.module';
import { AdminAreaDataModule } from './api/admin-area-data/admin-area-data.module';
import { HealthSiteModule } from './api/health-site/health-site.module';
import { DamSiteModule } from './api/dam-site/dam-site.module';
import { RainfallTriggersModule } from './api/rainfall-triggers/rainfall-triggers.module';
import { NotificationModule } from './api/notification/notification.module';
import { UserModule } from './api/user/user.module';
import { TyphoonTrackModule } from './api/typhoon-track/typhoon-track.module';
import { WhatsappModule } from './api/notification/whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
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
    RedcrossBranchModule,
    HealthSiteModule,
    DamSiteModule,
    AdminAreaDataModule,
    RainfallTriggersModule,
    TyphoonTrackModule,
    NotificationModule,
    UserModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {}
