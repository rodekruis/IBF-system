import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserModule } from './api/user/user.module';
import { DataModule } from './api/data/data.module';
import { HealthModule } from './health.module';
import { EapActionsModule } from './api/eap-actions/eap-actions.module';
import { ScriptsModule } from './scripts/scripts.module';
import { CountryModule } from './api/country/country.module';
import { WaterpointsModule } from './api/waterpoints/waterpoints.module';
import { EventModule } from './api/event/event.module';
import { MetadataModule } from './api/metadata/metadata.module';
import { AdminAreaModule } from './api/admin-area/admin-area.module';
import { GlofasStationModule } from './api/glofas-station/glofas-station.module';
import { UploadModule } from './api/upload/upload.module';
import { DisasterModule } from './api/disaster/disaster.module';
import { RedcrossBranchModule } from './api/redcross-branch/redcross-branch.module';
import { AdminAreaDataModule } from './api/admin-area-data/admin-area-data.module';
import { HealthSiteModule } from './api/health-site/health-site.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    DataModule,
    EapActionsModule,
    WaterpointsModule,
    ScriptsModule,
    HealthModule,
    CountryModule,
    EventModule,
    MetadataModule,
    AdminAreaModule,
    GlofasStationModule,
    UploadModule,
    DisasterModule,
    RedcrossBranchModule,
    HealthSiteModule,
    AdminAreaDataModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  public constructor() {}
}
