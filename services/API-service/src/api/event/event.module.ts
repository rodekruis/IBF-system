import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterTypeModule } from '../disaster-type/disaster-type.module';
import { MetadataModule } from '../metadata/metadata.module';
import { TyphoonTrackModule } from '../typhoon-track/typhoon-track.module';
import { UserEntity } from '../user/user.entity';
import { CountryModule } from './../country/country.module';
import { EapActionsModule } from './../eap-actions/eap-actions.module';
import { UserModule } from './../user/user.module';
import { AlertPerLeadTimeEntity } from './alert-per-lead-time.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventPlaceCodeEntity } from './event-place-code.entity';

@Module({
  imports: [
    UserModule,
    CountryModule,
    EapActionsModule,
    TyphoonTrackModule,
    DisasterTypeModule,
    MetadataModule,
    TypeOrmModule.forFeature([
      EventPlaceCodeEntity,
      AlertPerLeadTimeEntity,
      AdminAreaDynamicDataEntity,
      AdminAreaEntity,
      DisasterTypeEntity,
      UserEntity,
      CountryEntity,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService, HelperService],
  exports: [EventService],
})
export class EventModule {}
