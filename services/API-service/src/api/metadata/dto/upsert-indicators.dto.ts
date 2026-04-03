import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { IndicatorDto } from './indicator.dto';

export class UpsertIndicatorsDto {
  @ApiProperty({ type: [IndicatorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndicatorDto)
  public indicators: IndicatorDto[];
}
