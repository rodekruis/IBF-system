import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';
import { Type } from 'class-transformer';
import { GlofasStationForecastDto } from './station-forecast.dto';
import stations from '../../point-data/dto/example/glofas-stations/glofas-stations-UGA-triggered.json';

export class UploadTriggerPerStationDto {
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
