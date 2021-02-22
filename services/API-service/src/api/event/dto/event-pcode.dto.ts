import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventPcodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  public eventPcodeId: number;
}
