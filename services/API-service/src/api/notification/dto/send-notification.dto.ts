import { ApiProperty } from '@nestjs/swagger';

import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { countriesEnum } from '../../country/country.enum';
import { DisasterType } from '../../disaster-type/disaster-type.enum';

export class SendNotificationDto {
  @ApiProperty({
    example: Object.values(countriesEnum).join(' | '),
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(countriesEnum))
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
