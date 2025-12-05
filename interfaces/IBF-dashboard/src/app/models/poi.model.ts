import { AlertLevel } from 'src/app/types/alert-level';

export interface Station {
  stationName: string;
  stationCode: string;
  dynamicData?: StationDynamicData;
}

export type EapAlertClass = 'max' | 'med' | 'min' | 'no';

export interface StationDynamicData {
  forecastLevel: number;
  triggerLevel: number;
  forecastReturnPeriod: number;
  eapAlertClass: EapAlertClass; // REFACTOR: remove in favour of AlertLevel
}

export interface TyphoonTrackPoint {
  timestampOfTrackpoint: string;
  windspeed: number;
  category: string;
  firstLandfall: boolean;
  closestToLand: boolean;
}
export interface RedCrossBranch {
  branchName: string;
  numberOfVolunteers: number;
  contactPerson: string;
  contactAddress: string;
  contactNumber: string;
}

export interface ExposablePointData {
  dynamicData?: { exposure: string };
}

export interface Waterpoint extends ExposablePointData {
  fid: string;
  name: string;
  type: string;
  report_date: string;
}

export interface HealthSite extends ExposablePointData {
  name: string;
  type: string;
}

export interface DamSite {
  damName: string;
  countryCodeISO3: string;
  fullSupplyCapacity: number;
  latitude: string;
  longitude: string;
}

export interface EvacuationCenter {
  evacuationCenterName: string;
  countryCodeISO3: string;
  latitude: string;
  longitude: string;
}

export interface School extends ExposablePointData {
  name: string;
  type: string;
}

export interface CommunityNotification {
  nameVolunteer: string;
  nameVillage: string;
  description: string;
  type: string;
  uploadTime: string;
  dismissed: boolean;
  pointDataId: string;
  photoUrl: string;
}

export interface RiverGauge {
  fid: string;
  name: string;
  dynamicData: RiverGaugeDynamicData;
  pointDataId: string;
}

interface RiverGaugeDynamicData {
  'water-level': string;
  'water-level-previous': string;
  'water-level-reference': string;
  'water-level-alert-level': AlertLevel;
}
