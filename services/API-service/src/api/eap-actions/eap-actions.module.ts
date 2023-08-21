import { CountryEntity } from './../country/country.entity';
import { TriggerPerLeadTime } from '../event/trigger-per-lead-time.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { EapActionEntity } from './eap-action.entity';
import { EapActionStatusEntity } from './eap-action-status.entity';
import { EapActionsController } from './eap-actions.controller';
import { EapActionsService } from './eap-actions.service';
import { AreaOfFocusEntity } from './area-of-focus.entity';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { AdminAreaEntity } from '../admin-area/admin-area.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EapActionEntity,
      EapActionStatusEntity,
      AreaOfFocusEntity,
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
