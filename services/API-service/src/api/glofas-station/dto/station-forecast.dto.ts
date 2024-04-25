import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EapAlertClassKeyEnum } from '../../../shared/data.model';

export class GlofasStationForecastDto {
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
