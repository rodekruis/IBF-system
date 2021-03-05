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
import { UgaDataLevel2Module } from './api/uga-data-level-2/uga-data-level-2.module';
import { EventModule } from './api/event/event.module';
import { MetadataModule } from './api/metadata/metadata.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    DataModule,
    EapActionsModule,
    WaterpointsModule,
    ScriptsModule,
    HealthModule,
    UgaDataLevel2Module,
    CountryModule,
    EventModule,
    MetadataModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  public constructor() {}
}
