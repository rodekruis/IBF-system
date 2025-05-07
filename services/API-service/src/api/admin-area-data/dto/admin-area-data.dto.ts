import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { JoinColumn, ManyToOne } from 'typeorm';

import indicatorData from '../../../scripts/mock-data/drought/ETH/trigger/Belg JAS_Belg/upload-forecast_trigger-2.json';
import { DynamicDataPlaceCodeDto } from '../../admin-area-dynamic-data/dto/dynamic-data-place-code.dto';
import { StaticIndicator } from '../../admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { AdminLevel } from '../../country/admin-level.enum';
import { CountryEntity } from '../../country/country.entity';

export class AdminAreaDataDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  public adminLevel: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public placeCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public indicator: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public value: number;
}

export class AdminAreaDataJsonDto {
  @ApiProperty({ example: 'ETH' })
  @IsNotEmpty()
  @IsString()
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: 3 })
  @IsNotEmpty()
  @IsNumber()
  public adminLevel: AdminLevel;

  @ApiProperty({ example: StaticIndicator.hotspotGeneral })
  @IsNotEmpty()
  @IsEnum(StaticIndicator)
  @IsString()
  public indicator: StaticIndicator;

  @ApiProperty({ example: indicatorData })
  @IsArray()
  @ValidateNested()
  @Type(() => DynamicDataPlaceCodeDto)
  public dataPlaceCode: DynamicDataPlaceCodeDto[];
}

export interface AdminAreaDataParams {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
  indicator: StaticIndicator;
}
