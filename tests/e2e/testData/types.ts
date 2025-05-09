export interface Country {
  code: string;
  name: string;
  disasterTypes: string[];
}

export interface DisasterType {
  name: string;
  label: string;
}

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Layer {
  name: string;
  label: string;
  description: string;
  legendLabels: string[];
  active: boolean;
  type: string; // 'raster' | 'admin-area' | 'point'
  map: boolean;
  aggregate: boolean;
}

export interface Timeline {
  dateFormat: string;
  dateUnit: string; // 'days' | 'months' | 'hours'
}

export interface Aggregates {
  disclaimer: string;
}

export interface Dataset {
  country: Country;
  disasterType: DisasterType;
  scenario: string;
  user: User;
  title: string;
  aggregates: Aggregates;
  layers: Layer[];
  timeline: Timeline;
  eap: { actions: boolean };
  configurationId: number;
}
