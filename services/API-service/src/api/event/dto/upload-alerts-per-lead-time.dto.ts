import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import alertsPerLeadTime from '../../../scripts/mock-data/floods/UGA/trigger/G5075/alerts-per-lead-time.json';
import triggersPerLeadTime from '../../../scripts/mock-data/floods/UGA/trigger/G5075/triggers-per-lead-time.json';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import {
  AlertPerLeadTimeDto,
  TriggerPerLeadTimeDto,
} from './alert-per-lead-time.dto';

// NOTE: new DTO, used by new endpoint
export class UploadAlertsPerLeadTimeDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  @IsString()
  public disasterType: DisasterType;

  @ApiProperty({ example: 'Typhoon name' })
  @IsOptional()
  @IsString()
  public eventName: string;

  @ApiProperty({ example: alertsPerLeadTime })
  @IsArray()
  @ValidateNested()
  @Type(() => AlertPerLeadTimeDto)
  public alertsPerLeadTime: AlertPerLeadTimeDto[];

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}

// NOTE: old DTO, used by old endpoint. Remove this when all pipelines migrated.
export class UploadTriggerPerLeadTimeDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  @IsString()
  public disasterType: DisasterType;

  @ApiProperty({ example: 'Typhoon name' })
  @IsOptional()
  @IsString()
  public eventName: string;

  @ApiProperty({ example: triggersPerLeadTime })
  @IsArray()
  @ValidateNested()
  @Type(() => TriggerPerLeadTimeDto)
  public triggersPerLeadTime: TriggerPerLeadTimeDto[];

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
