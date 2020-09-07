export enum IndicatorGroup {
  general = 'General',
  vulnerability = 'Vulnerability',
}

export class Indicator {
  name: string;
  label: string;
  icon: string;
  active: boolean;
  numberFormat: NumberFormat;
  group: IndicatorGroup;
}

export enum NumberFormat {
  dec0 = 'dec0',
  dec2 = 'dec2',
  perc = 'perc'
}
