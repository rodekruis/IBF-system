import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'test@redcross.nl' })
  @IsNotEmpty()
  @IsString()
  public email: string;

  @ApiProperty({ example: 'abcd' })
  @IsNotEmpty()
  @MinLength(4)
  public password: string;
}
