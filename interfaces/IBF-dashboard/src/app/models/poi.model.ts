export class Station {
  stationName: string;
  stationCode: string;
  dynamicData?: StationDynamicData;
}

export class StationDynamicData {
  forecastLevel: number;
  triggerLevel: number;
  forecastReturnPeriod: number;
  eapAlertClass: string;
}

export class TyphoonTrackPoint {
  timestampOfTrackpoint: string;
  windspeed: number;
  category: string;
  firstLandfall: boolean;
  closestToLand: boolean;
}
export class RedCrossBranch {
  branchName: string;
  numberOfVolunteers: number;
  contactPerson: string;
  contactAddress: string;
  contactNumber: string;
}

export class Waterpoint {
  fid: string;
  name: string;
  type: string;
  report_date: string;
  dynamicData?: { exposure: string };
}

export class HealthSite {
  name: string;
  type: string;
  dynamicData?: { exposure: string };
}

export class DamSite {
  damName: string;
  countryCodeISO3: string;
  fullSupplyCapacity: number;
  latitude: string;
  longitude: string;
}

export class EvacuationCenter {
  evacuationCenterName: string;
  countryCodeISO3: string;
  latitude: string;
  longitude: string;
}

export class School {
  name: string;
  type: string;
  dynamicData?: { exposure: string };
}

export class CommunityNotification {
  public nameVolunteer: string;
  public nameVillage: string;
  public description: string;
  public type: string;
  public uploadTime: string;
  public dismissed: boolean;
  public pointDataId: string;
  public photoUrl: string;
}

export class RiverGauge {
  fid: string;
  name: string;
  dynamicData: {
    'water-level': string;
    'water-level-previous': string;
    'water-level-reference': string;
  };

  pointDataId: string;
}
