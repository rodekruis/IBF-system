import { ApiProperty } from '@nestjs/swagger';

import { StaticIndicator } from '../../api/admin-area-dynamic-data/enum/dynamic-indicator.enum';
import { LinesDataCategory } from '../../api/lines-data/lines-data.entity';
import { PointDataCategory } from '../../api/point-data/point-data.entity';

export class SeedDto {
  @ApiProperty({ example: true })
  hazards: boolean;

  @ApiProperty({ example: true })
  countries: boolean;

  @ApiProperty({ example: true })
  adminAreas: boolean;

  @ApiProperty({ example: true })
  users: boolean;

  @ApiProperty({ example: true })
  eapActions: boolean;

  @ApiProperty({ example: true })
  metadata: boolean;

  @ApiProperty({
    enum: StaticIndicator,
    isArray: true,
    default: Object.values(StaticIndicator),
  })
  indicators: StaticIndicator[];

  @ApiProperty({
    enum: PointDataCategory,
    isArray: true,
    default: Object.values(PointDataCategory),
  })
  pointData: PointDataCategory[];

  @ApiProperty({
    enum: LinesDataCategory,
    isArray: true,
    default: Object.values(LinesDataCategory),
  })
  lineData: LinesDataCategory[];
}

export const emptySeed: SeedDto = {
  hazards: false,
  countries: false,
  adminAreas: false,
  users: false,
  eapActions: false,
  metadata: false,
  indicators: [],
  pointData: [],
  lineData: [],
};

export const defaultSeed: SeedDto = {
  hazards: true,
  countries: true,
  adminAreas: true,
  users: true,
  eapActions: true,
  metadata: true,
  indicators: Object.values(StaticIndicator),
  pointData: Object.values(PointDataCategory),
  lineData: Object.values(LinesDataCategory),
};
