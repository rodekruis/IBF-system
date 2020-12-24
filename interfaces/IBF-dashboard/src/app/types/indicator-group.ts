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
  dec0 = 'dec0',
  dec2 = 'dec2',
  perc = 'perc',
}
