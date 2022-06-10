import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class TriggerPerLeadTimeDto {
  @ApiProperty({ example: '7-day' })
  @IsNotEmpty()
  @IsString()
  public leadTime: LeadTime;

  @ApiProperty({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  public triggered: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  public thresholdReached: boolean;
}
