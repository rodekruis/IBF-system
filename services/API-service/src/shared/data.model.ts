import { Geometry } from './geo.model';

export class AdminAreaRecord {
  public placeCode: string;
  public name: string;
  public geom: Geometry;
  public countryCodeISO3: string;
  public date: Date;
  public leadTime: string;
  public population_affected: number;
  public indicators: object;
}

export class TriggeredArea {
  public placeCode: string;
  public name: string;
  public population_affected: number;
}

export class EventSummaryCountry {
  public countryCodeISO3: string;
  public startDate: string;
  public endDate: string;
  public activeTrigger: boolean;
}
