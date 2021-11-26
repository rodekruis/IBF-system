// tslint:disable: variable-name
export class Station {
  stationName: string;
  stationCode: string;
  typhoonTrackName: string;
  typhoonTrackCode: string;
  triggerLevel: number;
  forecastLevel: number;
  forecastTrigger: number;
  forecastProbability: number;
  forecastReturnPeriod: number;
}

export class TyphoonTrackPoint {
  timestampOfTrackpoint: string;
}
export class RedCrossBranch {
  name: string;
  numberOfVolunteers: number;
  contactPerson: string;
  contactAddress: string;
  contactNumber: string;
}

export class Waterpoint {
  wpdxId: string;
  activityId: string;
  type: string;
  reportDate: string;
}

export class HealthSite {
  name: string;
  type: string;
}

export enum HealthSiteType {
  hospital = 'hospital',
  clinic = 'clinic',
}

export class DamSite {
  damName: string;
  countryCodeISO3: string;
  fullSupply: number;
  latitude: string;
  longitude: string;
}
