import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { PLACEHOLDER_SECRET } from '../../../config';

export class DeleteAdminAreasDto {
  @ApiProperty({
    description: 'Secret key for authorization',
    example: PLACEHOLDER_SECRET,
  })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({
    description: 'Array of placeCodes to be deleted',
    example: ['UG123', 'UG456'],
  })
  placeCodes: string[];
}
