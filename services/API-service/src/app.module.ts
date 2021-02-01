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

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    DataModule,
    EapActionsModule,
    WaterpointsModule,
    ScriptsModule,
    HealthModule,
<<<<<<< HEAD
    UgaDataLevel2Module,
=======
    CountryModule,
>>>>>>> 6e09fb9dd0a6fe1ca3431b982b5204a60d3c4119
  ],
  controllers: [AppController],
  providers: [],
})
export class ApplicationModule {
  public constructor() {}
}
