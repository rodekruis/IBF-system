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
import { LinesDataEnum } from '../lines-data.entity';

export class UploadLinesExposureStatusDto {
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

  @ApiProperty({ example: LinesDataEnum.roads })
  @IsNotEmpty()
  @IsEnum(LinesDataEnum)
  public linesDataCategory: LinesDataEnum;
}
