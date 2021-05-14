import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class UploadTriggerPerStationDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty({ example: '7-day' })
  @IsNotEmpty()
  @IsString()
  public leadTime: LeadTime;

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
  @IsNotEmpty()
  @IsNumber()
  public forecastReturnPeriod: number;
}
