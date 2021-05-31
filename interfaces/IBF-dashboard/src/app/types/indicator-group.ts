import { ColorBreaks, IbfLayerLabel, IbfLayerName } from './ibf-layer';

export enum IndicatorGroup {
  general = 'Exposure',
  vulnerability = 'Vulnerability',
  outline = 'outline',
}

export class Indicator {
  name: IbfLayerName;
  label: IbfLayerLabel;
  icon: string;
  active: boolean;
  numberFormatMap: NumberFormat;
  numberFormatAggregate: NumberFormat;
  aggregateIndicator: string;
  weightedAvg: boolean;
  group: IndicatorGroup;
  colorBreaks?: ColorBreaks;
  order: number;
  unit?: string;
  lazyLoad: boolean;
  dynamic?: boolean;
}

export enum NumberFormat {
  decimal0 = 'decimal0',
  decimal2 = 'decimal2',
  perc = 'perc',
}
