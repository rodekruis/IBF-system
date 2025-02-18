import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class AreaForecastDataDto {
  public placeCode: string;
  public leadTime: LeadTime;
  public forecastSeverity: number;
  public forecastTrigger: boolean;
  public mainExposureValue: number;
}
