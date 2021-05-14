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
import { ExposurePlaceCodeDto } from './exposure-place-code.dto';
import exposure from './example/upload-exposure-example.json';
import { LeadTime } from '../enum/lead-time.enum';
import { ExposureUnit } from '../enum/exposure-unit';

export class UploadAdminAreaDynamicDataDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: exposure })
  @IsArray()
  @ValidateNested()
  @Type(() => ExposurePlaceCodeDto)
  public exposurePlaceCodes: ExposurePlaceCodeDto[];

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  public adminLevel: number;

  @ApiProperty({ example: '0-month' })
  @IsNotEmpty()
  @IsString()
  public leadTime: LeadTime;

  @ApiProperty({ example: 'population' })
  @IsNotEmpty()
  @IsEnum(ExposureUnit)
  @IsString()
  public exposureUnit: ExposureUnit;
}
