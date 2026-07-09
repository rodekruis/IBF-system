import { DisasterType } from '../../../disaster-type/disaster-type.enum';
import { NotificationChannel } from '../enum/notification-channel.enum';

export interface CreateNotificationLogDto {
  channel: NotificationChannel;
  recipientCount: number;
  countryCodeISO3: string;
  disasterType: DisasterType;
  eventNames: string[];
}
