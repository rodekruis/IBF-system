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
  numberFormatMap: NumberFormat;
  numberFormatAggregate: NumberFormat;
  aggregateIndicator: boolean;
  group: IndicatorGroup;
}

export enum IndicatorName {
  PopulationAffected = 'population_affected',
  VulnerabilityIndex = 'vulnerability_index',
  PovertyIncidence = 'poverty_incidence',
  FemaleHeadHh = 'female_head_hh',
  PopulationU8 = 'population_u8',
  PopulationOver65 = 'population_over65',
  WallType = 'wall_type',
  RoofType = 'roof_type',
}

export enum NumberFormat {
  decimal0 = 'decimal0',
  decimal2 = 'decimal2',
  perc = 'perc',
}
