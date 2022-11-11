import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TyphoonCategory {
  TD = 'TD',
  TS = 'TS',
  STS = 'STS',
  TY = 'TY',
  STY = 'STY',
}

export class TrackpointDetailsDto {
  @ApiProperty({ example: 90.0 })
  @IsNotEmpty()
  @IsNumber()
  public lat: string;

  @ApiProperty({ example: 90.0 })
  @IsNotEmpty()
  @IsNumber()
  public lon: string;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  @IsString()
  public timestampOfTrackpoint: Date;

  @ApiProperty({ example: 100 })
  @IsNumber()
  public windspeed: number;

  @ApiProperty({ example: 'TS' })
  @IsEnum(TyphoonCategory)
  public category: TyphoonCategory;

  @ApiProperty({ example: false })
  @IsBoolean()
  public firstLandfall: boolean;
}
