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
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { AlertPerLeadTimeDto } from './alert-per-lead-time.dto';

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
