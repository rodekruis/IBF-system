import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { UserRole } from '../user-role.enum';
import { userRoleArray } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({ example: 'Henry' })
  @IsOptional()
  @IsString()
  public firstName?: string;

  @ApiProperty({ example: 'van' })
  @IsOptional()
  @IsString()
  public middleName?: string;

  @ApiProperty({ example: 'Dunant' })
  @IsString()
  @IsOptional()
  public lastName?: string;

  @ApiProperty({ enum: userRoleArray, example: userRoleArray.join(' | ') })
  @IsIn(userRoleArray)
  @IsOptional()
  public userRole?: UserRole;

  @ApiProperty({ example: '+31600000000' })
  @IsString()
  @IsOptional()
  public whatsappNumber?: string;

  @ApiProperty({ example: ['NLD'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public countries?: string[];

  @ApiProperty({ example: [DisasterType.Floods, DisasterType.Drought] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public disasterTypes?: DisasterType[];
}
