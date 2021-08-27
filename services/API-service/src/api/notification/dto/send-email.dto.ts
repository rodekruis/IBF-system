import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisasterType } from '../../disaster/disaster-type.enum';
import countries from '../../../scripts/json/countries.json';

export class SendEmailDto {
  @ApiProperty({ example: countries.map(c => c.countryCodeISO3).join(' | ') })
  @IsNotEmpty()
  @IsString()
  @IsIn(countries.map(c => c.countryCodeISO3))
  public countryCodeISO3: string;

  @ApiProperty({ example: Object.values(DisasterType).join(' | ') })
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(DisasterType))
  public disasterType: DisasterType;
}
