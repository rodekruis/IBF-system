import { IbfLayerLabel, IbfLayerName } from './ibf-layer';

export enum IndicatorGroup {
  general = 'Exposure',
  vulnerability = 'Vulnerability',
}

export class Indicator {
  name: IbfLayerName;
  label: IbfLayerLabel;
  icon: string;
  active: boolean;
  numberFormat: NumberFormat;
  group: IndicatorGroup;
}

export enum IndicatorEnum {
  PopulationExposed = 'population_affected',
}

export enum NumberFormat {
  dec0 = 'dec0',
  dec2 = 'dec2',
  perc = 'perc',
}
