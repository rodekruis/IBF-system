import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import exposure from '../../../scripts/mock-data/drought/ETH/trigger/Belg JAS_Belg/upload-alert_threshold-2.json';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { DynamicIndicator } from '../enum/dynamic-indicator.enum';
import { LeadTime } from '../enum/lead-time.enum';
import { DynamicDataPlaceCodeDto } from './dynamic-data-place-code.dto';

export class UploadAdminAreaDynamicDataDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: exposure })
  @IsArray()
  @ValidateNested()
  @Type(() => DynamicDataPlaceCodeDto)
  public exposurePlaceCodes: DynamicDataPlaceCodeDto[];

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  public adminLevel: number;

  @ApiProperty({ example: LeadTime.month0 })
  @IsNotEmpty()
  @IsString()
  @IsEnum(LeadTime)
  public leadTime: LeadTime;

  @ApiProperty({ example: DynamicIndicator.populationAffected })
  @IsNotEmpty()
  @IsEnum(DynamicIndicator)
  @IsString()
  public dynamicIndicator: DynamicIndicator;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  @IsString()
  public disasterType: DisasterType;

  @ApiProperty({ example: 'Typhoon name' })
  @IsOptional()
  @IsString()
  public eventName: string;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
