import { ApiProperty } from '@nestjs/swagger';

import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';

export class CountryDisasterTypeDto {
  @ApiProperty({
    example: Object.values(process.env.COUNTRIES.split(',')).join(' | '),
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(process.env.COUNTRIES.split(',')))
  public countryCodeISO3: string;

  @ApiProperty({ example: Object.values(DisasterType).join(' | ') })
  @IsNotEmpty()
  @IsString()
  @IsEnum(DisasterType)
  public disasterType: DisasterType;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
