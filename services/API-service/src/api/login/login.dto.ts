import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, Length } from 'class-validator';

import { DUNANT_EMAIL } from '../../config';

export class LoginDto {
  @ApiProperty({ example: DUNANT_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  public email: string;
}

export class LoginVerifyDto {
  @ApiProperty({ example: DUNANT_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @Length(6)
  public code: string;
}
