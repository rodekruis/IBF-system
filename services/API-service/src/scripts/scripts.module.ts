import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Arguments } from 'yargs';

import { ORMConfig } from '../../ormconfig';
import { AdminAreaDataModule } from '../api/admin-area-data/admin-area-data.module';
import { AdminAreaDynamicDataEntity } from '../api/admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../api/admin-area/admin-area.entity';
import { AdminAreaModule } from '../api/admin-area/admin-area.module';
import { CountryEntity } from '../api/country/country.entity';
import { CountryModule } from '../api/country/country.module';
import { EventModule } from '../api/event/event.module';
import { TriggerPerLeadTime } from '../api/event/trigger-per-lead-time.entity';
import { LinesDataModule } from '../api/lines-data/lines-data.module';
import { MetadataModule } from '../api/metadata/metadata.module';
import { PointDataModule } from '../api/point-data/point-data.module';
import { TyphoonTrackModule } from '../api/typhoon-track/typhoon-track.module';
import { UserModule } from '../api/user/user.module';
import { AdminAreaDynamicDataModule } from './../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { EapActionStatusEntity } from './../api/eap-actions/eap-action-status.entity';
import { EventPlaceCodeEntity } from './../api/event/event-place-code.entity';
import { GeoserverSyncService } from './geoserver-sync.service';
import { MockHelperService } from './mock-helper.service';
import { MockController } from './mock.controller';
import { MockService } from './mock.service';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import SeedAdminArea from './seed-admin-area';
import SeedAdminAreaData from './seed-admin-area-data';
import { SeedInit } from './seed-init';
import SeedLineData from './seed-line-data';
import SeedPointData from './seed-point-data';
import SeedProd from './seed-prod';

@Module({
  imports: [
    TypeOrmModule.forRoot(ORMConfig as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([
      EventPlaceCodeEntity,
      EapActionStatusEntity,
      AdminAreaEntity,
      CountryEntity,
      TriggerPerLeadTime,
      AdminAreaDynamicDataEntity,
    ]),
    AdminAreaModule,
    AdminAreaDynamicDataModule,
    CountryModule,
    EventModule,
    TyphoonTrackModule,
    UserModule,
    MetadataModule,
    PointDataModule,
    LinesDataModule,
    AdminAreaDataModule,
    HttpModule,
  ],
  providers: [
    SeedInit,
    SeedProd,
    ScriptsService,
    SeedAdminArea,
    SeedAdminAreaData,
    SeedPointData,
    SeedLineData,
    MockService,
    MockHelperService,
    GeoserverSyncService,
  ],
  controllers: [ScriptsController, MockController],
})
export class ScriptsModule {}

export interface InterfaceScript {
  run(argv: Arguments): Promise<void>;
}
