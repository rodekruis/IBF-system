import { AdminLevel } from 'src/app/types/admin-level';
import { DisasterTypeKey } from './../types/disaster-type-key';
import { LeadTime } from './../types/lead-time';
export class Country {
  countryCodeISO3: string;
  disasterTypeSettings: DisasterTypeSettings;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevels;
  countryName: string;
  countryActiveLeadTimes: LeadTime[];
  adminRegionLabels: AdminRegionLabels;
  eapLinks: EapLinks;
  countryLogos: string[];
  eapAlertClasses?: EapAlertClasses;
  disasterTypes: DisasterType[];
}

export class DisasterTypeSettings {
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevels;
}

export class EapAlertClasses {
  no: EapAlertClass;
  min: EapAlertClass;
  med: EapAlertClass;
  max: EapAlertClass;
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

class EapLinks {
  [DisasterTypeKey.floods]?: string;
  [DisasterTypeKey.heavyRain]?: string;
  [DisasterTypeKey.drought]?: string;
  [DisasterTypeKey.malaria]?: string;
  [DisasterTypeKey.dengue]?: string;
  [DisasterTypeKey.typhoon]?: string;
}

class AdminLevels {
  [DisasterTypeKey.floods]?: AdminLevel;
  [DisasterTypeKey.heavyRain]?: AdminLevel;
  [DisasterTypeKey.drought]?: AdminLevel;
  [DisasterTypeKey.malaria]?: AdminLevel;
  [DisasterTypeKey.dengue]?: AdminLevel;
  [DisasterTypeKey.typhoon]?: AdminLevel;
}
