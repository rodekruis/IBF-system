import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

import { UserRole } from '../user-role.enum';
import { UserStatus } from '../user-status.enum';
import { userRoleArray } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({ example: 'Henry' })
  @IsOptional()
  @IsString()
  public firstName?: string;

  @ApiProperty({ example: 'Middle name' })
  @IsOptional()
  @IsString()
  public middleName?: string;

  @ApiProperty({ example: 'Dunant' })
  @IsString()
  @IsOptional()
  public lastName?: string;

  @ApiProperty({
    enum: userRoleArray,
    example: userRoleArray.join(' | '),
  })
  @IsIn(userRoleArray)
  @IsOptional()
  public role?: UserRole;

  @ApiProperty({
    example: UserStatus.Active,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  public status?: UserStatus; // TODO: Remove this unused field?

  @ApiProperty({ example: '+31600000000' })
  @IsString()
  @IsOptional()
  public whatsappNumber?: string;
}
