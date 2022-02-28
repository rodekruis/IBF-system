import { EapActionsModule } from './../eap-actions/eap-actions.module';
import { CountryModule } from './../country/country.module';
import { EventPlaceCodeEntity } from './event-place-code.entity';
import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggerPerLeadTime } from './trigger-per-lead-time.entity';
import { AdminAreaDynamicDataEntity } from '../admin-area-dynamic-data/admin-area-dynamic-data.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { HelperService } from '../../shared/helper.service';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [
    UserModule,
    CountryModule,
    EapActionsModule,
    TypeOrmModule.forFeature([
      EventPlaceCodeEntity,
      TriggerPerLeadTime,
      AdminAreaDynamicDataEntity,
      AdminAreaEntity,
      DisasterEntity,
      UserEntity,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService, HelperService],
  exports: [EventService],
})
export class EventModule {}
