import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class EapActionDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  public action: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['UGA', 'ZMB'])
  public countryCode: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsBoolean()
  public status: boolean;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  public pcode: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsNumber()
  public event: number;
}
