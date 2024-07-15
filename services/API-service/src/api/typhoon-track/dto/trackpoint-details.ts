import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

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
  @IsDate()
  @Type(() => Date)
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

  @ApiProperty({ example: false })
  @IsBoolean()
  public closestToLand: boolean;
}
