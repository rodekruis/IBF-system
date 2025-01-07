import { LeadTime } from '../../api/admin-area-dynamic-data/enum/lead-time.enum';
import { AdminLevel } from '../../api/country/admin-level.enum';
import { DisasterType } from '../../api/disaster/disaster-type.enum';
import { DroughtSeasonRegions } from './drought-season-regions.interface';

export interface Country {
  countryCodeISO3: string;
  countryDisasterSettings: CountryDisasterSettings[];
  countryName: string;
  adminRegionLabels: AdminRegionLabels;
  countryLogos: Record<string, string[]>;
  disasterTypes: DisasterType[];
  notificationInfo?: NotificationInfo;
}

export interface CountryDisasterSettings {
  disasterType: DisasterType;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: LeadTime[];
  droughtForecastSeasons: DroughtSeasonRegions;
  droughtAreas: Record<string, string[]>;
  eapLink: string;
  showMonthlyEapActions: boolean;
  droughtEndOfMonthPipeline?: boolean;
  isEventBased: boolean;
  eapAlertClasses?: EapAlertClasses;
  monthlyForecastInfo?: Record<string, string | string[]>;
  enableEarlyActions?: boolean;
  enableStopTrigger?: boolean;
}

export interface NotificationInfo {
  linkVideo: string;
  linkPdf: string;
}

export interface EapAlertClasses {
  no?: EapAlertClass;
  min?: EapAlertClass;
  med?: EapAlertClass;
  max?: EapAlertClass;
}

export interface EapAlertClass {
  label: string;
  color: string;
  value: number;
  textColor?: string;
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
