import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { CountryEntity } from './../country/country.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionEntity } from './eap-action.entity';
import { EapActionsController } from './eap-actions.controller';
import { EapActionsService } from './eap-actions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EapActionEntity,
      EapActionStatusEntity,
      TriggerPerLeadTime,
      CountryEntity,
      EventPlaceCodeEntity,
      AdminAreaEntity,
    ]),
    UserModule,
    HttpModule,
  ],
  controllers: [EapActionsController],
  providers: [EapActionsService],
  exports: [EapActionsService],
})
export class EapActionsModule {}
