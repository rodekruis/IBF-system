import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JoinColumn, ManyToOne } from 'typeorm';
import { CountryEntity } from '../../country/country.entity';

export class DamSiteDto {
  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  @IsString()
  public damName: string;

  @ApiProperty({ example: 0 })
  public fullSupplyCapacity: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}

export class UploadDamSiteCsvDto extends DamSiteDto {}

export class UploadDamSiteJsonDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: [DamSiteDto] })
  @IsArray()
  @ValidateNested()
  @Type(() => DamSiteDto)
  public damSitesData: DamSiteDto[];
}
