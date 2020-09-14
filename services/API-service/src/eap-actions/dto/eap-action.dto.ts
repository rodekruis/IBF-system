/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
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
}
