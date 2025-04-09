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
import { DisasterTypeModule } from '../api/disaster-type/disaster-type.module';
import { AlertPerLeadTimeEntity } from '../api/event/alert-per-lead-time.entity';
import { EventModule } from '../api/event/event.module';
import { LinesDataModule } from '../api/lines-data/lines-data.module';
import { MetadataModule } from '../api/metadata/metadata.module';
import { PointDataModule } from '../api/point-data/point-data.module';
import { ProcessEventsModule } from '../api/process-events/process-events.module';
import { TyphoonTrackModule } from '../api/typhoon-track/typhoon-track.module';
import { UserModule } from '../api/user/user.module';
import { AdminAreaDynamicDataModule } from './../api/admin-area-dynamic-data/admin-area-dynamic-data.module';
import { EapActionStatusEntity } from './../api/eap-actions/eap-action-status.entity';
import { EventPlaceCodeEntity } from './../api/event/event-place-code.entity';
import { GeoserverSyncService } from './geoserver-sync.service';
import { MockHelperService } from './mock-helper.service';
import { MockService } from './mock.service';
import { ScriptsController } from './scripts.controller';
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
      AlertPerLeadTimeEntity,
      AdminAreaDynamicDataEntity,
    ]),
    AdminAreaModule,
    AdminAreaDynamicDataModule,
    CountryModule,
    DisasterTypeModule,
    EventModule,
    ProcessEventsModule,
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
    SeedAdminArea,
    SeedAdminAreaData,
    SeedPointData,
    SeedLineData,
    MockService,
    MockHelperService,
    GeoserverSyncService,
  ],
  controllers: [ScriptsController],
})
export class ScriptsModule {}

export interface InterfaceScript {
  run(argv: Arguments, includeLinesData?: boolean): Promise<void>;
}
