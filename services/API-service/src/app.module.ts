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
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  public constructor() {}
}
