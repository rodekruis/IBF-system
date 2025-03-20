import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelperService } from '../../shared/helper.service';
import { EventPlaceCodeEntity } from '../event/event-place-code.entity';
import { EventModule } from '../event/event.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { ProcessEventsController } from './process-events.controller';
import { ProcessEventsService } from './process-events.service';

@Module({
  imports: [
    UserModule,
    EventModule,
    NotificationModule,
    TypeOrmModule.forFeature([EventPlaceCodeEntity]),
  ],
  controllers: [ProcessEventsController],
  providers: [ProcessEventsService, HelperService],
  exports: [ProcessEventsService],
})
export class ProcessEventsModule {}
