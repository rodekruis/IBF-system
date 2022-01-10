import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JoinColumn, ManyToOne } from 'typeorm';
import { CountryEntity } from '../../country/country.entity';

export class HealthSiteDto {
  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  @IsString()
  public name: string;
  @ApiProperty({ example: 'hospital' })
  @IsNotEmpty()
  @IsString()
  public type: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}

export class UploadHealthSiteCsvDto extends HealthSiteDto {}

export class UploadHealthSiteJsonDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: [HealthSiteDto] })
  @IsArray()
  @ValidateNested()
  @Type(() => HealthSiteDto)
  public healthSitesData: HealthSiteDto[];
}
