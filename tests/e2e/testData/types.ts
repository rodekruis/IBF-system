export interface Country {
  code: string;
  name: string;
}

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Indicator {
  name: string;
  label: string;
  legendLabels: string[];
  active: boolean;
}

export interface Dataset {
  country: Country;
  hazard: string;
  hazards: string[];
  scenario: string;
  user: User;
  title: string;
  indicators: Indicator[];
}
