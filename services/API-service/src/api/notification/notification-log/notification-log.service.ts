import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateNotificationLogDto } from './dto/create-notification-log.dto';
import { NotificationLogEntity } from './notifcation-log.entity';

@Injectable()
export class NotificationLogService {
  private logger = new Logger('NotificationLogService');

  @InjectRepository(NotificationLogEntity)
  private readonly notificationLogRepository: Repository<NotificationLogEntity>;

  createNotificationLog = ({
    channel,
    recipientCount,
    countryCodeISO3,
    disasterType,
    eventNames,
  }: CreateNotificationLogDto) => {
    this.logger.log(
      `Creating notification log for channel: ${channel}, recipientCount: ${recipientCount}, countryCodeISO3: ${countryCodeISO3}, disasterType: ${disasterType}, eventNames: ${eventNames.join(',')}`,
    );

    const notificationLog = new NotificationLogEntity();
    notificationLog.channel = channel;
    notificationLog.recipientCount = recipientCount;
    notificationLog.countryCodeISO3 = countryCodeISO3;
    notificationLog.disasterType = disasterType;
    notificationLog.eventNames = eventNames.join(',');

    return this.notificationLogRepository.save(notificationLog);
  };
}
