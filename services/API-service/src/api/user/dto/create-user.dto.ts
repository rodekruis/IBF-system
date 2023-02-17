import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';
import { UserStatus } from '../user-status.enum';
import countries from '../../../scripts/json/countries.json';
import disasterTypes from '../../../scripts/json/disasters.json';

const userRoleArray = Object.values(UserRole).map(item => String(item));

export class CreateUserDto {
  @ApiProperty({ example: 'dunant@redcross.nl' })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: 'dunant' })
  @IsString()
  @IsNotEmpty()
  public username: string;

  @ApiProperty({ example: 'Henry' })
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public middleName?: string;

  @ApiProperty({ example: 'Dunant' })
  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @ApiProperty({
    enum: userRoleArray,
    example: userRoleArray.join(' | '),
  })
  @IsIn(userRoleArray)
  @IsNotEmpty()
  public role: UserRole;

  @ApiProperty({
    example: countries.map(c => c.countryCodeISO3),
    default: [],
  })
  @IsArray()
  @ArrayNotEmpty()
  public countryCodesISO3: string[];

  @ApiProperty({
    example: disasterTypes.map(c => c.disasterType),
    default: [],
  })
  @IsArray()
  @ArrayNotEmpty()
  public disasterTypes: string[];

  @ApiProperty({
    example: UserStatus.Active,
    default: UserStatus.Inactive,
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  public status: UserStatus;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @MinLength(4)
  public password: string;

  @ApiProperty({ example: '+31600000000' })
  @IsString()
  @IsOptional()
  public whatsappNumber: string;
}
