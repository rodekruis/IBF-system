import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  public forecastProbability: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  public forecastTrigger: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsOptional()
  public forecastReturnPeriod: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  public triggerLevel: number;
}
