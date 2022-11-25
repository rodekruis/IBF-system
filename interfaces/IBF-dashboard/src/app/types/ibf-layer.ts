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
  dynamic?: boolean;
}

export enum IbfLayerThreshold {
  potentialCasesThreshold = 'potential_cases_threshold',
}

export enum IbfLayerType {
  point = 'point',
  shape = 'shape',
  wms = 'wms',
}

export enum IbfLayerName {
  glofasStations = 'glofas_stations',
  typhoonTrack = 'typhoon_track',
  redCrossBranches = 'red_cross_branches',
  redCrescentBranches = 'red_crescent_branches',
  waterpoints = 'waterpoints',
  floodExtent = 'flood_extent',
  rainfallExtent = 'rainfall_extent',
  rainfallForecast = 'rainfall_forecast',
  population = 'population',
  adminRegions = 'adminRegions',
  adminRegions1 = 'adminRegions1',
  adminRegions2 = 'adminRegions2',
  adminRegions3 = 'adminRegions3',
  adminRegions4 = 'adminRegions4',
  cropland = 'cropland',
  grassland = 'grassland',
  population_affected = 'population_affected',
  population_affected_percentage = 'population_affected_percentage',
  populationTotal = 'populationTotal',
  vulnerability_score = 'vulnerability_score',
  flood_vulnerability_index = 'flood_vulnerability_index',
  poverty_incidence = 'poverty_incidence',
  female_head_hh = 'female_head_hh',
  population_u8 = 'population_u8',
  population_over65 = 'population_over65',
  wall_type = 'wall_type',
  roof_type = 'roof_type',
  covidRisk = 'covid_risk',
  healthSites = 'health_sites',
  damSites = 'dams',
  alertThreshold = 'alert_threshold',
  potentialCases = 'potential_cases',
  potentialCases65 = 'potential_cases_65',
  potentialCasesU9 = 'potential_cases_U9',
  potentialCasesU5 = 'potential_cases_U5',
  malariaRisk = 'malaria_risk',
  vulnerableGroup = 'vulnerable_group',
  vulnerableHousing = 'vulnerable_housing',
  totalHouses = 'total_houses',
  malariaSuitableTemperature = 'malaria_suitable_temperature',
  totalIdps = 'total_idps',
  motorizedTravelTimeToHealth = 'motorized_travel_time_to_health',
  walkingTravelTimeToHealth = 'walking_travel_time_to_health',
  travel_time_cities = 'travel_time_cities',
  population_u5 = 'population_u5',
  ipcForecastShort = 'IPC_forecast_short',
  ipcForecastLong = 'IPC_forecast_long',
  hotspotGeneral = 'Hotspot_General',
  hotspotWater = 'Hotspot_Water',
  hotspotHealth = 'Hotspot_Health',
  hotspotNutrition = 'Hotspot_Nutrition',
  windspeed = 'windspeed',
  rainfall = 'rainfall',
  housesAffected = 'houses_affected',
  affectedPopulation = 'affected_population',
  probWithin50Km = 'prob_within_50km',
  droughtPhaseClassification = 'drought_phase_classification',
  vegetationCondition = 'vegetation_condition',
  livestockBodyCondition = 'livestock_body_condition',
  evacuationCenters = 'evacuation_centers',
}

export enum IbfLayerLabel {
  glofasStations = 'Glofas stations',
  typhoonTrack = 'Typhoon track',
  redCrossBranches = 'Red Cross branches',
  redCrescentBranches = 'Red Crescent branches',
  waterpoints = 'Waterpoints',
  floodExtent = 'Flood extent',
  rainfallExtent = 'Rainfall extent',
  population = 'Population',
  populationTotal = 'Total Population',
  adminRegions1 = 'Admin Level 1',
  adminRegions2 = 'Admin Level 2',
  adminRegions3 = 'Admin Level 3',
  adminRegions4 = 'Admin Level 4',
  cropland = 'Cropland',
  grassland = 'Grassland',
  covidRisk = 'Covid Risk',
  healthSites = 'Health Sites',
  damSites = 'Dam Sites',
  evacuationCenters = 'Evacuation Centers',
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
  outline = 'outline',
  adminRegions = 'adminRegions',
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

export enum LeafletPane {
  overlayPane = 'overlayPane',
  aggregatePane = 'ibf-aggregate',
  adminBoundaryPane = 'ibf-admin-boundaries',
  wmsPane = 'ibf-wms',
  popupPane = 'popup',
  outline = 'outline',
}
