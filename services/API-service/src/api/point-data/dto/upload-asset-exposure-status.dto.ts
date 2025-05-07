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

import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { PointDataCategory } from '../point-data.entity';

export class UploadAssetExposureStatusDto {
  @ApiProperty({ example: ['123', '234'] })
  @IsArray()
  public exposedFids: string[];

  @ApiProperty({ example: LeadTime.hour1 })
  @IsNotEmpty()
  @IsString()
  @IsEnum(LeadTime)
  public leadTime: LeadTime;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;

  @ApiProperty({ example: 'MWI' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: DisasterType.FlashFloods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  public disasterType: DisasterType;

  @ApiProperty({ example: PointDataCategory.healthSites })
  @IsNotEmpty()
  @IsEnum(PointDataCategory)
  public pointDataCategory: PointDataCategory;
}

export class UploadDynamicPointDataDto {
  @ApiProperty({ example: LeadTime.hour1 })
  @IsOptional()
  @IsString()
  @IsEnum(LeadTime)
  public leadTime: LeadTime;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;

  @ApiProperty({ example: DisasterType.FlashFloods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  public disasterType: DisasterType;

  @ApiProperty({ example: PointDataCategory.gauges })
  public pointDataCategory: PointDataCategory;

  @ApiProperty({ example: 'water-level' })
  public key: string;

  @ApiProperty({ example: [{ fid: 1, value: 100 }] })
  @IsArray()
  @ValidateNested()
  @Type(() => DynamicPointData)
  public dynamicPointData: DynamicPointData[];
}

export class DynamicPointData {
  @ApiProperty()
  @IsNotEmpty()
  public fid: string;

  @ApiProperty()
  public value: string;
}
