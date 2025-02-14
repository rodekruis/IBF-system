import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

// NOTE: new DTO, used by new endpoint
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

// NOTE: old DTO, used by old endpoint. Remove this when all pipelines migrated.
export class TriggerPerLeadTimeDto {
  @ApiProperty({ example: '7-day' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(LeadTime)
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
