import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DynamicDataPlaceCodeDto {
  @ApiProperty({ example: 'ET14' })
  @IsNotEmpty()
  @IsString()
  public placeCode: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  public amount: number; // REFACTOR: use value instead of amount
}
