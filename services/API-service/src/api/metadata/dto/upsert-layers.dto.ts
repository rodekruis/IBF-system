import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { LayerDto } from './layer.dto';

export class UpsertLayersDto {
  @ApiProperty({ type: [LayerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayerDto)
  public layers: LayerDto[];
}
