import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiModelProperty({ example: 'dunant@redcross.nl' })
  @IsNotEmpty()
  readonly email: string;

  @ApiModelProperty({ example: 'password' })
  @IsNotEmpty()
  readonly password: string;
}
