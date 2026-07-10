import { ApiProperty } from '@nestjs/swagger';

import { NotificationLogDto } from './notification-log.dto';

export class NotificationLogPageDto {
  @ApiProperty({
    type: [NotificationLogDto],
    description: 'Notification logs, most recent first',
  })
  public logs: NotificationLogDto[];

  @ApiProperty({
    example: 42,
    description: 'Total number of notification logs matching the filters',
  })
  public total: number;
}
