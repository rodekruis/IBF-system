import { ApiProperty } from '@nestjs/swagger';

import { MultiPolygon, Polygon } from 'geojson';

import { AdminLevel } from '../../country/admin-level.enum';
import { DisasterType } from '../../disaster-type/disaster-type.enum';
import { AlertLevel } from '../../event/enum/alert-level.enum';

export interface AdminAreaParams {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
}

export interface EventAdminAreaParams extends AdminAreaParams {
  disasterType: DisasterType;
}

export interface EventAdminAreaQuery {
  leadTime: string;
  eventName: string;
  placeCodeParent: string;
}

export interface AdminArea {
  placeCode: string;
  eventName: string;
  countryCodeISO3: string;
  alertLevel: AlertLevel;
  geom: Polygon | MultiPolygon;
  [key: string]: unknown;
}

export class AdminAreaUpdateResult {
  @ApiProperty({ example: 0 })
  public upserted: number;

  @ApiProperty({ example: 0 })
  public deleted: number;

  @ApiProperty({ example: 0 })
  public untouched: number;
}
