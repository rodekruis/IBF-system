import { CRS, Layer, LayerGroup, Marker } from 'leaflet';

export class IbfLayer {
  type: IbfLayerType;
  name: IbfLayerName;
  label: IbfLayerLabel;
  description: string;
  active: boolean;
  show: boolean;
  viewCenter: boolean;
  order: number;
  colorProperty?: string;
  wms?: IbfLayerWMS;
  data?: GeoJSON.FeatureCollection;
  leafletLayer?: Layer | LayerGroup | Marker;
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
  waterpoints = 'waterpoints',
  floodExtent = 'flood_extent',
  population = 'population',
  adminRegions = 'Admin regions',
  cropland = 'cropland',
  grassland = 'grassland',
}

export enum IbfLayerLabel {
  glofasStations = 'Glofas stations',
  redCrossBranches = 'Red Cross branches',
  waterpoints = 'Waterpoints',
  floodExtent = 'Flood extent',
  population = 'Population',
  adminRegions = 'Admin regions',
  cropland = 'Cropland',
  grassland = 'Grassland',
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
