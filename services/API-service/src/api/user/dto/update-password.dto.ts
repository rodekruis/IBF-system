import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  public password: string;
}
