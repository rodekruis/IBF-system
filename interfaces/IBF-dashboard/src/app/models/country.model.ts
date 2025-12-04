import { AdminLevel } from 'src/app/types/admin-level';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { LeadTime, LeadTimeUnit } from 'src/app/types/lead-time';

export class Country {
  countryCodeISO3: string;
  countryDisasterSettings: CountryDisasterSettings[];
  countryName: string;
  adminRegionLabels: AdminRegionLabels;
  countryLogos: Record<string, string[]>;
  disasterTypes: DisasterType[];
  notificationInfo: NotificationInfo;
}

export class CountryDisasterSettings {
  disasterType: DisasterTypeKey;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: LeadTime[];
  droughtSeasonRegions: DroughtSeasonRegions;
  droughtRegions: Record<string, string[]>;
  eapLink: string;
  showMonthlyEapActions: boolean;
  forecastSource?: ForecastSource;
  enableEarlyActions?: boolean;
}

export interface ForecastSource {
  label: string;
  url?: string;
  setTriggerSource?: string;
}

export interface DroughtSeason {
  rainMonths: number[];
  actionMonths: number[];
}

export type DroughtSeasons = Record<string, DroughtSeason>;

export type DroughtSeasonRegions = Record<string, DroughtSeasons>;

export class NotificationInfo {
  linkVideo: string;
  linkPdf: string;
}

export class AdminRegionLabels {
  1?: AdminRegionLabel;
  2?: AdminRegionLabel;
  3?: AdminRegionLabel;
  4?: AdminRegionLabel;
}

export class AdminRegionLabel {
  singular: string;
  plural: string;
}

export class DisasterType {
  disasterType: DisasterTypeKey;
  label: string;
  leadTimeUnit: LeadTimeUnit;
  minLeadTime: LeadTime;
  maxLeadTime: LeadTime;
  mainExposureIndicator: IbfLayerName;
  enableSetWarningToTrigger: boolean;
  alertLevel: boolean;
}
