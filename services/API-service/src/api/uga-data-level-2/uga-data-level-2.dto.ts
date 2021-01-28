import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Max,
  Length,
  Min,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class UgaDataLevel2Dto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  @Length(11, 11)
  public pcode: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  public covidrisk: number;
}
