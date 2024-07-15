import { ApiProperty } from '@nestjs/swagger';

import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import countries from '../../../scripts/json/countries.json';
import { DisasterType } from '../../disaster/disaster-type.enum';

export class SendNotificationDto {
  @ApiProperty({ example: countries.map((c) => c.countryCodeISO3).join(' | ') })
  @IsNotEmpty()
  @IsString()
  @IsIn(countries.map((c) => c.countryCodeISO3))
  public countryCodeISO3: string;

  @ApiProperty({ example: Object.values(DisasterType).join(' | ') })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(DisasterType))
  public disasterType: DisasterType;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
