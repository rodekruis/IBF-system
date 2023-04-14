import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { DisasterType } from '../../disaster/disaster-type.enum';
import { PointDataEnum } from '../point-data.entity';

export class UploadAssetExposureStatusDto {
  @ApiProperty({ example: ['123', '234'] })
  @IsArray()
  public exposedFids: string[];

  @ApiProperty({ example: LeadTime.hour1 })
  @IsNotEmpty()
  @IsString()
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

  @ApiProperty({ example: PointDataEnum.healthSites })
  @IsNotEmpty()
  @IsEnum(PointDataEnum)
  public pointDataCategory: PointDataEnum;
}
