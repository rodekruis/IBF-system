import { LeadTime } from '../enum/lead-time.enum';

export interface UploadTyphoonTrackDto {
  countryCodeISO3: string;
  leadTime: LeadTime;
  eventName: string;
  trackpointDetails: TrackpointDetailsDto[];
  readonly date: Date;
}

export enum TyphoonCategory {
  TD = 'TD',
  TS = 'TS',
  STS = 'STS',
  TY = 'TY',
  STY = 'STY',
}

export interface TrackpointDetailsDto {
  lat: number;
  lon: number;
  timestampOfTrackpoint: Date;
  windspeed: number;
  category: TyphoonCategory;
  firstLandfall: boolean;
  closestToLand: boolean;
}
