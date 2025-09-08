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

interface ForecastSource {
  label: string;
  url?: string;
}

export interface CountryDisasterSettingsDto {
  disasterType: string;
  adminLevels: AdminLevel[];
  defaultAdminLevel: AdminLevel;
  activeLeadTimes: string[];
  droughtSeasonRegions?: object;
  showMonthlyEapActions?: boolean;
  enableEarlyActions?: boolean;
  enableStopTrigger?: boolean;
  forecastSource?: ForecastSource;
  eapLink: string;
  droughtRegions?: object;
}

export interface AddCountriesDto {
  countries: CountryDto[];
}
