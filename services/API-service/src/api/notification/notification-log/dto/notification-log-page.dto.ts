import { ApiProperty } from '@nestjs/swagger';

import { NotificationLogEntity } from '../notifcation-log.entity';

export class NotificationLogPageDto {
  @ApiProperty({
    type: [NotificationLogEntity],
    description: 'Notification logs, most recent first',
  })
  public logs: NotificationLogEntity[];

  @ApiProperty({
    example: 42,
    description: 'Total number of notification logs matching the filters',
  })
  public total: number;
}
