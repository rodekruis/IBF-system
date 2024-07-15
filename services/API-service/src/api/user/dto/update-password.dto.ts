import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'abcd' })
  @IsNotEmpty()
  @MinLength(4)
  public password: string;

  @ApiProperty({ example: 'test@redcross.nl' })
  @IsOptional()
  @IsString()
  public email: string;
}
