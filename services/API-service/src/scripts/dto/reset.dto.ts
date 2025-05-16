import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { PLACEHOLDER_SECRET } from '../../config';

export class ResetDto {
  @ApiProperty({ example: PLACEHOLDER_SECRET })
  @IsNotEmpty()
  @IsString()
  public readonly secret: string;
}
