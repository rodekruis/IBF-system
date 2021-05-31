import { AdminLevel } from 'src/app/types/admin-level';
import { LeadTime } from './../types/lead-time';
export class Country {
  countryCodeISO3: string;
  defaultAdminLevel: AdminLevel;
  countryName: string;
  countryActiveLeadTimes: LeadTime[];
  adminRegionLabels: string[];
  eapLink: string;
  countryLogos: string[];
  eapAlertClasses?: EapAlertClasses;
  disasterTypes: DisasterType[];
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

export class DisasterType {
  disasterType: string;
  label: string;
  leadTimes: LeadTimeEntity[];
  actionsUnit: string;
  triggerUnit: string;
}

class LeadTimeEntity {
  leadTimeName: LeadTime;
  leadTimeLabel: string;
  countries: Country[];
  disasterTypes: DisasterType[];
}
