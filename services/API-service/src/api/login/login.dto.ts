import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { DUNANT_EMAIL } from '../../config';

export class LoginDto {
  @ApiProperty({ example: DUNANT_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: '123456' })
  @IsNumber()
  @IsOptional()
  @IsInt()
  @Min(100000)
  @Max(999999)
  public code: number;
}
