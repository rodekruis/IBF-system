import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'dunant@redcross.nl' })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @MinLength(4)
  public password: string;
}
