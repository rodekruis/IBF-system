import { LeadTime } from '../enum/lead-time.enum';

export class UploadTyphoonTrackDto {
  public countryCodeISO3: string;
  public leadTime: LeadTime;
  public eventName: string;
  public trackpointDetails: TrackpointDetailsDto[];
  public readonly date: Date;
}

export enum TyphoonCategory {
  TD = 'TD',
  TS = 'TS',
  STS = 'STS',
  TY = 'TY',
  STY = 'STY',
}

export class TrackpointDetailsDto {
  public lat: number;
  public lon: number;
  public timestampOfTrackpoint: Date;
  public windspeed: number;
  public category: TyphoonCategory;
  public firstLandfall: boolean;
  public closestToLand: boolean;
}
