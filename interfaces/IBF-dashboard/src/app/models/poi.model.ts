// tslint:disable: variable-name
export class Station {
  stationName: string;
  stationCode: string;
  triggerLevel: number;
  forecastLevel: number;
  forecastTrigger: number;
  forecastProbability: number;
  forecastReturnPeriod: number;
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
  type: number;
}
export class DamSite {
  damName: string;
  countryCodeISO3: string;
  percentageFull: string;
  fullSupply: string;
  currentCapacity: string;
  latitude: string;
  longitude: string;
}
