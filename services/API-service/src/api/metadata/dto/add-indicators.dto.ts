import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

import { NumberFormat } from '../../../shared/enums/number-format.enum';

export class IndicatorDto {
  @ApiProperty({
    example: {
      UGA: {
        floods: ['map', 'aggregate'],
      },
    },
  })
  public countryDisasterTypes: JSON;

  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsString()
  public label: string;

  @ApiProperty({ example: 'logo.svg' })
  @IsString()
  public icon: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  public weightedAvg: boolean;

  @ApiProperty({ example: 'total_houses', nullable: true })
  @IsString()
  public weightVar: string;

  @ApiProperty({ example: 'yes' })
  @IsIn(['yes', 'no', 'if-trigger'])
  public active: string;

  @ApiProperty({
    example: {
      '1': { label: 'Very Low', valueLow: 0, valueHigh: 2 },
      '2': { label: 'Low', valueLow: 2, valueHigh: 4 },
      '3': { label: 'Average', valueLow: 4, valueHigh: 6 },
      '4': { label: 'High', valueLow: 6, valueHigh: 8 },
      '5': { label: 'Very High', valueLow: 8, valueHigh: 10 },
    },
  })
  public colorBreaks: JSON;

  @ApiProperty({ example: NumberFormat.decimal0 })
  @IsString()
  public numberFormatMap: NumberFormat;

  @ApiProperty({ example: 'decimal0' })
  @IsIn(['decimal0', 'decimal2', 'perc'])
  public numberFormatAggregate: string;

  @ApiProperty()
  @IsNumber()
  public order: number;

  @ApiProperty()
  @IsBoolean()
  public dynamic: boolean;

  @ApiProperty({ example: 'people' })
  @IsString()
  public unit: string;

  @ApiProperty()
  @IsBoolean()
  public lazyLoad: boolean;

  @ApiProperty({
    example: {
      UGA: {
        floods: 'description',
      },
    },
  })
  public description: JSON;
}

export class AddIndicatorsDto {
  @ApiProperty({
    example: [{}],
  })
  @IsNotEmpty()
  public indicators: IndicatorDto[];
}
