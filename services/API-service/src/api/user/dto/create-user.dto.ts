import { ApiProperty } from '@nestjs/swagger';

import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { DUNANT_EMAIL } from '../../../config';
import countries from '../../../scripts/json/countries.json';
import disasterTypes from '../../../scripts/json/disaster-types.json';
import { UserRole } from '../user-role.enum';

export const userRoleArray = Object.values(UserRole).map((item) =>
  String(item),
);

export class CreateUserDto {
  @ApiProperty({ example: DUNANT_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: 'Henry' })
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @ApiProperty({ default: null, required: false })
  @IsString()
  @IsOptional()
  public middleName?: string;

  @ApiProperty({ example: 'Dunant' })
  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @ApiProperty({ enum: userRoleArray, example: userRoleArray.join(' | ') })
  @IsIn(userRoleArray)
  @IsNotEmpty()
  public userRole: UserRole;

  @ApiProperty({
    example: countries.map((c) => c.countryCodeISO3),
    default: [],
  })
  @IsArray()
  @ArrayNotEmpty()
  public countryCodesISO3: string[];

  @ApiProperty({
    example: disasterTypes.map((c) => c.disasterType),
    default: [],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  public disasterTypes?: string[];

  @ApiProperty({ example: 'password', required: false })
  @IsNotEmpty()
  @MinLength(4)
  @IsOptional()
  public password?: string;

  @ApiProperty({ example: '+31600000000' })
  @IsString()
  @IsOptional()
  public whatsappNumber: string;
}
