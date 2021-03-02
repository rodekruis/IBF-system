import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventPlaceCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public eventPlaceCodeId: string;
}
