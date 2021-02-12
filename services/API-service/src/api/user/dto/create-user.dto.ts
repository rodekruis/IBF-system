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
import { CountryEntity } from '../../country/country.entity';
import { ManyToMany } from 'typeorm';
import { UserStatus } from '../user-status.enum';
import { UserEntity } from '../user.entity';

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  public middleName?: string;

  @ApiProperty({ example: 'Dunant' })
  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @ApiProperty({
    example: UserRole.DisasterManager,
    default: UserRole.Guest,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  public role: UserRole;

  @ApiProperty({
    example: UserRole.DisasterManager,
    default: UserRole.Guest,
    type: [CountryEntity],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ManyToMany(
    (): typeof CountryEntity => CountryEntity,
    (country): UserEntity[] => country.users,
  )
  public countries: CountryEntity[];

  @ApiProperty({
    example: UserStatus.Active,
    default: UserStatus.Inactive,
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  public status: UserStatus;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  public password: string;
}
