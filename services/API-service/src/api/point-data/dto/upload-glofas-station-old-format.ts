import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class UploadGlofasStationDynamicOldFormatDto {
  public countryCodeISO3: string;
  public leadTime: LeadTime;
  public date: Date;
  public stationForecasts: GlofasStationForecastDto[];
}

class GlofasStationForecastDto {
  public stationCode: string;
  public forecastLevel: string;
  public eapAlertClass: string;
  public forecastReturnPeriod: number | string;
  public triggerLevel: number;
}
