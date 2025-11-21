import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  public readonly userId: string;
}
