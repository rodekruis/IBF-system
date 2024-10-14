import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { EapAlertClassKeyEnum } from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import stations from './example/glofas-stations/glofas-stations-UGA-triggered.json';

export class UploadGlofasStationDynamicOldFormatDto {
  @ApiProperty({ example: 'UGA' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: '5-day' })
  @IsNotEmpty()
  @IsString()
  public leadTime: LeadTime;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;

  @ApiProperty({ example: stations })
  @IsArray()
  @ValidateNested()
  @Type(() => GlofasStationForecastDto)
  public stationForecasts: GlofasStationForecastDto[];
}

class GlofasStationForecastDto {
  @ApiProperty({ example: 'G1374' })
  @IsNotEmpty()
  @IsString()
  public stationCode: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  public forecastLevel: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsIn(Object.values(EapAlertClassKeyEnum))
  public eapAlertClass: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  public forecastReturnPeriod: number | string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  public triggerLevel: number;
}
