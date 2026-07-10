import { ApiProperty } from '@nestjs/swagger';

export class NotificationLogMetricsDto {
  @ApiProperty({
    example: 10,
    description: 'Number of distinct events notified about in the period',
  })
  public events: number;

  @ApiProperty({
    example: 25,
    description:
      'Number of unique users who received a notification in the period, across all channels',
  })
  public users: number;

  @ApiProperty({
    example: 30,
    description: 'Number of users who received an email in the period',
  })
  public email: number;

  @ApiProperty({
    example: 20,
    description: 'Number of users who received a WhatsApp in the period',
  })
  public whatsapp: number;
}
