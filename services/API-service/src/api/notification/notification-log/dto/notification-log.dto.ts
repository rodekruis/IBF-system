import { ApiProperty } from '@nestjs/swagger';

import { DisasterType } from '../../../disaster-type/disaster-type.enum';
import { NotificationChannel } from '../enum/notification-channel.enum';

export class NotificationLogDto {
  @ApiProperty({ example: 'e64ff821-a297-42ce-bbc0-c74b0c65b7c6' })
  public notificationLogId: string;

  @ApiProperty({
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  public channel: NotificationChannel;

  @ApiProperty({
    example: 30,
    description: 'Number of users who received the notification',
  })
  public recipientCount: number;

  @ApiProperty({ example: 'UGA' })
  public countryCodeISO3: string;

  @ApiProperty({ enum: DisasterType, example: DisasterType.Floods })
  public disasterType: DisasterType;

  @ApiProperty({ example: ['G5075'] })
  public eventNames: string[];

  @ApiProperty({ example: new Date() })
  public createdAt: Date;
}
