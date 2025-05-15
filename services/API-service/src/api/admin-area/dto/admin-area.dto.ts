import { ApiProperty } from '@nestjs/swagger';

import { AdminLevel } from '../../country/admin-level.enum';

export interface AdminAreaParams {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
}

export class AdminAreaUpdateResult {
  @ApiProperty({ example: 0 })
  public upserted: number;

  @ApiProperty({ example: 0 })
  public deleted: number;

  @ApiProperty({ example: 0 })
  public untouched: number;
}
