import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';
import { UserStatus } from '../user-status.enum';

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
    example: UserRole.DisasterManager,
    default: UserRole.Guest,
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  public role: UserRole;

  @ApiProperty({
    example: ['UGA', 'KEN', 'ETH', 'ZMB'],
    default: [],
  })
  @IsArray()
  @ArrayNotEmpty()
  public countryCodesISO3: string[];

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
}
