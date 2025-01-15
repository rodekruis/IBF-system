export class CountryDto {
  countryCodeISO3: string;
  countryName: string;
  countryDisasterSettings: CountryDisasterSettingsDto[];
  adminRegionLabels: object;
  countryLogos: object;
  countryBoundingBox: BoundingBox;
  disasterTypes: string[];
}

export class CountryDisasterSettingsDto {
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

export class AddCountriesDto {
  countries: CountryDto[];
}
