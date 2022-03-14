import { AdminLevel } from 'src/app/types/admin-level';
import { DisasterTypeKey } from './../types/disaster-type-key';
import { LeadTime } from './../types/lead-time';
export class Country {
  countryCodeISO3: string;
  countryDisasterSettings: CountryDisasterSettings[];
  countryName: string;
  adminRegionLabels: AdminRegionLabels;
  countryLogos: string[];
  disasterTypes: DisasterType[];
}

export class CountryDisasterSettings {
  disasterType: DisasterTypeKey;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: LeadTime[];
  droughtForecastMonths: number[];
  eapLink: string;
  showMonthlyEapActions: boolean;
  eapAlertClasses?: EapAlertClasses;
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
  valueLow: number;
  valueHigh: number;
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
  leadTimes: LeadTimeEntity[];
  actionsUnit: string;
  triggerUnit: string;
  activeTrigger: boolean;
}

class LeadTimeEntity {
  leadTimeName: LeadTime;
  leadTimeLabel: string;
  countries: Country[];
  disasterTypes: DisasterType[];
}
