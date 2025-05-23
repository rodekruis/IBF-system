import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class AlertPerLeadTimeDto {
  @ApiProperty({ example: '7-day' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(LeadTime)
  public leadTime: LeadTime;

  @ApiProperty({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  public forecastAlert: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  public forecastTrigger: boolean;
}
