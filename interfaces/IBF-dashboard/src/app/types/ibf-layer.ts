import {
  CRS,
  GeoJSON,
  Layer,
  LayerGroup,
  Marker,
  MarkerClusterGroup,
} from 'leaflet';
import { NumberFormat } from './indicator-group';

export class IbfLayerMetadata {
  name: IbfLayerName;
  label: IbfLayerLabel;
  type: IbfLayerType;
  active: string;
  legendColor: string;
  leadTimeDependent: boolean;
}

export class IbfLayer {
  type: IbfLayerType;
  name: IbfLayerName;
  label: IbfLayerLabel;
  description: string;
  active: boolean;
  show: boolean;
  viewCenter: boolean;
  order: number;
  unit?: string;
  colorProperty?: string;
  colorBreaks?: ColorBreaks;
  numberFormatMap?: NumberFormat;
  wms?: IbfLayerWMS;
  data?: GeoJSON.FeatureCollection;
  leafletLayer?: Layer | LayerGroup | Marker | GeoJSON | MarkerClusterGroup;
  legendColor?: string;
  group?: IbfLayerGroup;
}

export enum IbfLayerType {
  point = 'point',
  shape = 'shape',
  wms = 'wms',
}

export enum IbfLayerName {
  glofasStations = 'glofas_stations',
  redCrossBranches = 'red_cross_branches',
  redCrescentBranches = 'red_crescent_branches',
  waterpoints = 'waterpoints',
  floodExtent = 'flood_extent',
  rainfallExtent = 'rainfall_extent',
  population = 'population',
  adminRegions = 'admin_regions',
  cropland = 'cropland',
  grassland = 'grassland',
  population_affected = 'population_affected',
  vulnerability_score = 'vulnerability_score',
  vulnerability_index = 'vulnerability_index',
  poverty_incidence = 'poverty_incidence',
  female_head_hh = 'female_head_hh',
  population_u8 = 'population_u8',
  population_over65 = 'population_over65',
  wall_type = 'wall_type',
  roof_type = 'roof_type',
  covidRisk = 'covidrisk',
}

export enum IbfLayerLabel {
  glofasStations = 'Glofas stations',
  redCrossBranches = 'Red Cross branches',
  redCrescentBranches = 'Red Crescent branches',
  waterpoints = 'Waterpoints',
  floodExtent = 'Flood extent',
  rainfallExtent = 'Rainfall extent',
  population = 'Population',
  adminRegions = 'Admin Regions',
  cropland = 'Cropland',
  grassland = 'Grassland',
  covidRisk = 'Covid Risk',
}

export class IbfLayerWMS {
  url: string;
  name: string;
  format: string;
  version: string;
  attribution: string;
  crs?: CRS;
  transparent: boolean;
}

export enum IbfLayerGroup {
  aggregates = 'aggregates',
}

export class ColorBreaks {
  1: ColorBreak;
  2: ColorBreak;
  3: ColorBreak;
  4: ColorBreak;
  5: ColorBreak;
}

export class ColorBreak {
  label: string;
  valueLow: number;
  valueHigh: number;
}
