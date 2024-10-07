import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { CountryEntity } from '../country/country.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { TyphoonTrackModule } from '../typhoon-track/typhoon-track.module';
import { UserEntity } from '../user/user.entity';
import { CountryModule } from './../country/country.module';
import { EapActionsModule } from './../eap-actions/eap-actions.module';
import { UserModule } from './../user/user.module';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';

@Module({
  imports: [
    UserModule,
    CountryModule,
    EapActionsModule,
    TyphoonTrackModule,
    TypeOrmModule.forFeature([
      EventPlaceCodeEntity,
      TriggerPerLeadTime,
      AdminAreaDynamicDataEntity,
      AdminAreaEntity,
      DisasterEntity,
      UserEntity,
      CountryEntity,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService, HelperService],
  exports: [EventService],
})
export class EventModule {}
