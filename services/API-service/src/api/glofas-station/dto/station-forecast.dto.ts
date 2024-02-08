import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsIn(['no', 'min', 'med', 'max'])
  public eapAlertClass: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  public forecastReturnPeriod: number | string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  public triggerLevel: number;
}
