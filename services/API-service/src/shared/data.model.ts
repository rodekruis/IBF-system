import { Geometry } from './geo.model';

export class AdminAreaRecord {
  public placeCode: string;
  public name: string;
  public geom: Geometry;
  public countryCodeISO3: string;
  public date: Date;
  public leadTime: string;
  public population_affected: number;
}

export class AggregateDataRecord {
  public placeCode: string;
  public indicator: string;
  public value: number;
}

export class TriggeredArea {
  public placeCode: string;
  public name: string;
  public actionsValue: number;
}

export class EventSummaryCountry {
  public countryCodeISO3: string;
  public startDate: string;
  public endDate: string;
  public activeTrigger: boolean;
}
