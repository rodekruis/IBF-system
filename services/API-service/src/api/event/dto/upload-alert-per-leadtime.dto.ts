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

import triggers from '../../../scripts/mock-data/floods/UGA/trigger/G5075/alerts-per-leadtime.json';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import {
  AlertPerLeadTimeDto,
  TriggerPerLeadTimeDto,
} from './alert-per-leadtime.dto';

// NOTE: new DTO, used by new endpoint
export class UploadAlertPerLeadTimeDto {
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

  @ApiProperty({ example: triggers })
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

  @ApiProperty({ example: triggers })
  @IsArray()
  @ValidateNested()
  @Type(() => TriggerPerLeadTimeDto)
  public triggersPerLeadTime: TriggerPerLeadTimeDto[];

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
