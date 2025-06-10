import { LeadTime } from '../enum/lead-time.enum';

export interface UploadTyphoonTrackDto {
  countryCodeISO3: string;
  leadTime: LeadTime;
  eventName: string;
  trackpointDetails: TrackpointDetailsDto[];
  readonly date: Date;
}

export enum TyphoonCategory { // https://www.pagasa.dost.gov.ph/information/about-tropical-cyclone
  TropicalDepression = 'TD', // a tropical cyclone with maximum sustained winds of up to 62 kilometers per hour (kph) or less than 34 nautical miles per hour (knots)
  TropicalStorm = 'TS', // a tropical cyclone with maximum wind speed of 62 to 88 kph or 34 - 47 knots
  // eslint-disable-next-line perfectionist/sort-enums
  SevereTropicalStorm = 'STS', // a tropical cyclone with maximum wind speed of 87 to 117 kph or 48 - 63 knots
  Typhoon = 'TY', // a tropical cyclone with maximum wind speed of 118 to 184 kph or 64 - 99 knots
  // eslint-disable-next-line perfectionist/sort-enums
  SuperTyphoon = 'STY', // a tropical cyclone with maximum wind speed exceeding 185 kph or more than 100 knots
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
