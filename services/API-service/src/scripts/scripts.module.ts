import { EapActionStatusEntity } from './../api/eap-actions/eap-action-status.entity';
import { EventPlaceCodeEntity } from './../api/event/event-place-code.entity';
import { AdminAreaDynamicDataModule } from './../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arguments } from 'yargs';
import { ScriptsController } from './scripts.controller';
import { SeedInit } from './seed-init';
import { GlofasStationModule } from '../api/glofas-station/glofas-station.module';
import { ScriptsService } from './scripts.service';
import { EventModule } from '../api/event/event.module';
import { UserModule } from '../api/user/user.module';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import { LeadTimeEntity } from '../api/lead-time/lead-time.entity';
import { CountryEntity } from '../api/country/country.entity';
import { TyphoonTrackModule } from '../api/typhoon-track/typhoon-track.module';
import SeedProd from './seed-prod';
import { MetadataModule } from '../api/metadata/metadata.module';
import SeedAdminArea from './seed-admin-area';
import { AdminAreaModule } from '../api/admin-area/admin-area.module';
import { CountryModule } from '../api/country/country.module';
import SeedAdminAreaData from './seed-admin-area-data';
import SeedPointData from './seed-point-data';
import SeedGlofasStation from './seed-glofas-station';
import SeedRainfallData from './seed-rainfall-data';
import { PointDataModule } from '../api/point-data/point-data.module';
import { AdminAreaDataModule } from '../api/admin-area-data/admin-area-data.module';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { LinesDataModule } from '../api/lines-data/lines-data.module';
import SeedLineData from './seed-line-data';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      migrations: [`src/migrations/*.{ts,js}`],
      entities: ['src/app/**/*.entity.{ts,js}'],
    }),
    TypeOrmModule.forFeature([
      EventPlaceCodeEntity,
      EapActionStatusEntity,
      AdminAreaEntity,
      LeadTimeEntity,
      CountryEntity,
      TriggerPerLeadTime,
      AdminAreaDynamicDataEntity,
    ]),
    AdminAreaModule,
    AdminAreaDynamicDataModule,
    CountryModule,
    GlofasStationModule,
    EventModule,
    TyphoonTrackModule,
    UserModule,
    MetadataModule,
    PointDataModule,
    LinesDataModule,
    AdminAreaDataModule,
  ],
  providers: [
    SeedInit,
    SeedProd,
    ScriptsService,
    SeedAdminArea,
    SeedAdminAreaData,
    SeedPointData,
    SeedLineData,
    SeedGlofasStation,
    SeedRainfallData,
  ],
  controllers: [ScriptsController],
})
export class ScriptsModule {}

export interface InterfaceScript {
  run(argv: Arguments): Promise<void>;
}
