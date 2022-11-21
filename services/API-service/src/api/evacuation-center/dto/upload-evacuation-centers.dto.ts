import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CountryEntity } from '../../../api/country/country.entity';
import { JoinColumn, ManyToOne } from 'typeorm';

export class EvacuationCenterDto {
  @ApiProperty({ example: 'name ' })
  @IsNotEmpty()
  @IsString()
  public evacuationCenterName: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;
}

export class UploadEvacuationCenterCsvDto extends EvacuationCenterDto {}

export class UploadEvacuationCenterJsonDto {
  @ApiProperty({ example: 'PHL' })
  @IsNotEmpty()
  @IsString()
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: [EvacuationCenterDto] })
  @IsArray()
  @ValidateNested()
  @Type(() => EvacuationCenterDto)
  public evacuationCenterData: EvacuationCenterDto[];
}
