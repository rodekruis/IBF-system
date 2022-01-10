import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JoinColumn, ManyToOne } from 'typeorm';
import { CountryEntity } from '../../country/country.entity';

export class RedCrossBranchDto {
  @ApiProperty({ example: 'branch name' })
  @IsNotEmpty()
  @IsString()
  public branchName: string;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lat: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  public lon: number;

  @ApiProperty({ example: 3 })
  @IsString()
  @IsOptional()
  public numberOfVolunteers: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contactPerson: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contactAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public contactNumber: string;
}

export class UploadRedCrossBranchCsvDto extends RedCrossBranchDto {}

export class UploadRedCrossBranchJsonDto {
  @ApiProperty({ example: 'ETH' })
  @IsNotEmpty()
  @IsString()
  @ManyToOne((): typeof CountryEntity => CountryEntity)
  @JoinColumn({
    name: 'countryCodeISO3',
    referencedColumnName: 'countryCodeISO3',
  })
  public countryCodeISO3: string;

  @ApiProperty({ example: [RedCrossBranchDto] })
  @IsArray()
  @ValidateNested()
  @Type(() => RedCrossBranchDto)
  public branchData: RedCrossBranchDto[];
}
