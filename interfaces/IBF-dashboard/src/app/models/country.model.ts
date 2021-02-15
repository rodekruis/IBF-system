import { AdminLevel } from 'src/app/types/admin-level';
import { LeadTime } from 'src/app/types/lead-time';

// tslint:disable: variable-name
export class Country {
  countryCodeISO3: string;
  defaultAdminLevel: AdminLevel;
  countryName: string;
  countryLeadTimes: LeadTime[];
  adminRegionLabels: string[];
  eapLink: string;
  countryLogos: string[];
  eapAlertClasses?: EapAlertClasses;
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
