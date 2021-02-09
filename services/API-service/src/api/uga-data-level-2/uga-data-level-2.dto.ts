import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Max,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UgaDataLevel2Dto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  public pcode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  public covidrisk: number;
}
