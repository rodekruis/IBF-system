import { IsNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiModelProperty({ example: 'test-user' })
  @IsNotEmpty()
  readonly username: string;

  @ApiModelProperty()
  @IsNotEmpty()
  readonly password: string;
}
