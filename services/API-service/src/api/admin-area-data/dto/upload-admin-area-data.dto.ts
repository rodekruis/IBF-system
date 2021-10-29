import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DynamicDataPlaceCodeDto } from '../../admin-area-dynamic-data/dto/dynamic-data-place-code.dto';
import indicatorData from '../../admin-area-dynamic-data/dto/example/ETH/malaria/upload-exposure.json';
import { DynamicIndicator } from '../../admin-area-dynamic-data/enum/dynamic-data-unit';
import { AdminLevel } from '../../country/admin-level.enum';
import { JoinColumn, ManyToOne } from 'typeorm';
import { CountryEntity } from '../../country/country.entity';

export class UploadAdminAreaDataCsvDto {
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
  public indicator: number;

  @ApiProperty()
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
  @IsEnum(DynamicIndicator)
  @IsString()
  public indicator: DynamicIndicator;

  @ApiProperty({ example: indicatorData })
  @IsArray()
  @ValidateNested()
  @Type(() => DynamicDataPlaceCodeDto)
  public dataPlaceCode: DynamicDataPlaceCodeDto[];
}
