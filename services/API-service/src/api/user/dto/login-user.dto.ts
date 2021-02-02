import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiModelProperty({ example: 'dunant@redcross.nl' })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiModelProperty({ example: 'password' })
  @IsNotEmpty()
  @MinLength(4)
  public password: string;
}
