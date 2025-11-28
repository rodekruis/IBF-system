export interface Country {
  code: string;
  name: string;
  disasterTypes: string[];
  defaultAdminAreaLabelSingular: string;
}

export interface DisasterType {
  name: string;
  label: string;
}

export interface User {
  firstName: string;
  lastName: string;
}

export interface Layer {
  name: string;
  label: string;
  description: string;
  legendLabels: string[];
  active: boolean;
  type: string; // 'wms' | 'admin-area' | 'point' | 'line'
  map: boolean;
  aggregate: boolean;
}

export interface Timeline {
  dateFormat: string;
  dateFormatAlert?: string;
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
