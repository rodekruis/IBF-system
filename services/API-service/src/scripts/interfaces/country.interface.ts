import { Polygon } from 'geojson';

import { LeadTime } from '../../api/admin-area-dynamic-data/enum/lead-time.enum';
import { AdminLevel } from '../../api/country/admin-level.enum';
import { ForecastSource } from '../../api/country/country-disaster.entity';
import { DisasterType } from '../../api/disaster-type/disaster-type.enum';
import { DroughtSeasonRegions } from './drought-season-regions.interface';

export interface Country {
  countryCodeISO3: string;
  countryDisasterSettings: CountryDisasterSettings[];
  countryName: string;
  adminRegionLabels: Partial<AdminRegionLabels>;
  countryLogos: Partial<Record<DisasterType, string[]>>;
  disasterTypes: DisasterType[];
  notificationInfo?: NotificationInfo;
  countryBoundingBox: Polygon;
}

export interface CountryDisasterSettings {
  disasterType: DisasterType;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: LeadTime[];
  droughtSeasonRegions: DroughtSeasonRegions;
  droughtRegions?: Record<string, string[]>;
  eapLink: string;
  showMonthlyEapActions?: boolean;
  forecastSource?: ForecastSource;
  enableEarlyActions?: boolean;
}

export interface NotificationInfo {
  linkVideo: string;
  linkPdf: string;
}

export interface AdminRegionLabels {
  1: AdminRegionLabel;
  2: AdminRegionLabel;
  3: AdminRegionLabel;
  4: AdminRegionLabel;
}

export interface AdminRegionLabel {
  singular: string;
  plural: string;
}
