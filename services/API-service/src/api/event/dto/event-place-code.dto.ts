import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventPlaceCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  public eventPlacecodeId: number;
}
