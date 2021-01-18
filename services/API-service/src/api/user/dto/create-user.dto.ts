import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiModelProperty({ example: 'test-user' })
  @IsNotEmpty()
  public readonly email: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @MinLength(4)
  public readonly password: string;
}
