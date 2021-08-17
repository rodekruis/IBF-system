import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DynamicDataPlaceCodeDto } from './dynamic-data-place-code.dto';
import exposure from './example/upload-exposure-PHL.json';
import { LeadTime } from '../enum/lead-time.enum';
import { DynamicIndicator } from '../enum/dynamic-data-unit';
import { DisasterType } from '../../disaster/disaster-type.enum';

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

  @ApiProperty({ example: '0-month' })
  @IsNotEmpty()
  @IsString()
  public leadTime: LeadTime;

  @ApiProperty({ example: 'population_affected' })
  @IsNotEmpty()
  @IsEnum(DynamicIndicator)
  @IsString()
  public dynamicIndicator: DynamicIndicator;

  @ApiProperty({ example: DisasterType.Floods })
  @IsNotEmpty()
  @IsEnum(DisasterType)
  @IsString()
  public disasterType: DisasterType;
}
