import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';

export class ProcessEventsDto {
  @ApiProperty({
    example: Object.values(process.env.COUNTRIES.split(',')).join(' | '),
  })
  @IsNotEmpty()
  @IsString()
  public countryCodeISO3: string; // REFACTOR: add validation using IsIn

  @ApiProperty({ example: Object.values(DisasterType).join(' | ') })
  @IsNotEmpty()
  @IsString()
  @IsEnum(DisasterType)
  public disasterType: DisasterType;

  @ApiProperty({ example: new Date() })
  @IsOptional()
  public date: Date;
}
