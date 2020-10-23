/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class EapActionDto {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  readonly action: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['UGA', 'ZMB'])
  readonly countryCode: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsBoolean()
  readonly status: boolean;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  readonly pcode: string;
}
