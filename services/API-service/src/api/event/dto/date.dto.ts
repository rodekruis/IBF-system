import { ApiProperty } from '@nestjs/swagger';

export class DateDto {
  @ApiProperty({ example: new Date().toISOString() })
  public date: string;
}

export class TriggerPerLeadTimeExampleDto {
  @ApiProperty({ example: new Date().toISOString() })
  public date: string;

  @ApiProperty({ example: '0' })
  public '1-day': string;

  @ApiProperty({ example: '0' })
  public '2-day': string;

  @ApiProperty({ example: '0' })
  public '3-day': string;

  @ApiProperty({ example: '1' })
  public '4-day': string;

  @ApiProperty({ example: '1' })
  public '5-day': string;

  @ApiProperty({ example: '1' })
  public '6-day': string;

  @ApiProperty({ example: '1' })
  public '7-day': string;
}
