import { AdminLevel } from '../enum/admin-level.enum';

export interface CountryDto {
  countryCodeISO3: string;
  countryName: string;
  countryDisasterSettings: CountryDisasterSettingsDto[];
  adminRegionLabels: object;
  countryLogos: object;
  countryBoundingBox: any; //BoundingBox;
  disasterTypes: string[];
}

export interface CountryDisasterSettingsDto {
  disasterType: string;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: string[];
  droughtSeasonRegions?: object;
  droughtEndOfMonthPipeline?: boolean;
  showMonthlyEapActions?: boolean;
  enableEarlyActions?: boolean;
  enableStopTrigger?: boolean;
  monthlyForecastInfo?: object;
  eapLink: string;
  eapAlertClasses?: object;
  droughtRegions?: object;
  isEventBased?: boolean;
}

export interface AddCountriesDto {
  countries: CountryDto[];
}
