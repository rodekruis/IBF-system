import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';

import { DUNANT_EMAIL } from '../../config';

export class LoginDto {
  @ApiProperty({ example: DUNANT_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsOptional()
  @Length(6)
  public code: string;
}
