import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationLogEntity } from './notifcation-log.entity';
import { NotificationLogService } from './notification-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLogEntity])],
  providers: [NotificationLogService],
  exports: [NotificationLogService],
})
export class NotificationLogModule {}
