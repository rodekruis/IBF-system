import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

import { DUNANT_EMAIL } from '../../../config';

export class LoginUserDto {
  @ApiProperty({ example: DUNANT_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @MinLength(4)
  public password: string;
}
