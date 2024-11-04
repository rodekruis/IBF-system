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

import { DynamicDataPlaceCodeDto } from '../../admin-area-dynamic-data/dto/dynamic-data-place-code.dto';
import indicatorData from '../../admin-area-dynamic-data/dto/example/ETH/drought/upload-alert_threshold-2.json';
import { UpdateableStaticIndicator } from '../../admin-area-dynamic-data/enum/dynamic-data-unit';
import { AdminLevel } from '../../country/admin-level.enum';
import { CountryEntity } from '../../country/country.entity';

export class UploadAdminAreaDataDto {
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

export class UploadAdminAreaDataJsonDto {
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

  @ApiProperty({ example: 'Hotspot_General' })
  @IsNotEmpty()
  @IsEnum(UpdateableStaticIndicator)
  @IsString()
  public indicator: UpdateableStaticIndicator;

  @ApiProperty({ example: indicatorData })
  @IsArray()
  @ValidateNested()
  @Type(() => DynamicDataPlaceCodeDto)
  public dataPlaceCode: DynamicDataPlaceCodeDto[];
}
