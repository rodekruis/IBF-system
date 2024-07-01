import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty()
  @IsNotEmpty()
  public readonly password: string;
}
