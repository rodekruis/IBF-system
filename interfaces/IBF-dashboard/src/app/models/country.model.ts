import { AdminLevel } from 'src/app/types/admin-level';
import { DisasterTypeKey } from './../types/disaster-type-key';
import { LeadTime, LeadTimeUnit } from './../types/lead-time';
export class Country {
  countryCodeISO3: string;
  countryDisasterSettings: CountryDisasterSettings[];
  countryName: string;
  adminRegionLabels: AdminRegionLabels;
  countryLogos: { [disasterType: string]: string[] };
  disasterTypes: DisasterType[];
  notificationInfo: NotificationInfo;
}

export class CountryDisasterSettings {
  disasterType: DisasterTypeKey;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: LeadTime[];
  droughtForecastSeasons: DroughtForecastSeasons;
  droughtAreas: { [area: string]: string[] };
  eapLink: string;
  showMonthlyEapActions: boolean;
  droughtEndOfMonthPipeline?: boolean;
  isEventBased: boolean;
  eapAlertClasses?: EapAlertClasses;
  monthlyForecastInfo?: {
    [key: string]: string[] | string;
  };
  enableEarlyActions?: boolean;
  enableStopTrigger?: boolean;
}

export class DroughtForecastSeasons {
  [area: string]: {
    [season: string]: {
      rainMonths: number[];
      actionMonths: number[];
    };
  };
}

export class NotificationInfo {
  linkVideo: string;
  linkPdf: string;
}

export class EapAlertClasses {
  no?: EapAlertClass;
  min?: EapAlertClass;
  med?: EapAlertClass;
  max?: EapAlertClass;
}

export class EapAlertClass {
  label: string;
  color: string;
  value: number;
}

export class AdminRegionLabels {
  1: AdminRegionLabel;
  2: AdminRegionLabel;
  3: AdminRegionLabel;
  4: AdminRegionLabel;
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
  actionsUnit: string;
  triggerUnit: string;
  activeTrigger: boolean;
}
