import {
  CRS,
  GeoJSON,
  Layer,
  LayerGroup,
  Marker,
  MarkerClusterGroup,
} from 'leaflet';
import { NumberFormat } from 'src/app/types/indicator-group';

export class IbfLayerMetadata {
  name: IbfLayerName;
  label: IbfLayerLabel;
  type: IbfLayerType;
  active: string;
  legendColor: JSON;
  leadTimeDependent: boolean;
  description: JSON;
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
  leafletLayer?: GeoJSON | Layer | LayerGroup | Marker | MarkerClusterGroup;
  legendColor?: JSON | string;
  group?: IbfLayerGroup;
  dynamic?: boolean;
  isLoading?: boolean;
}

export enum wmsLegendType {
  exposureLine = 'exposure-line',
  exposureSquare = 'exposure-square',
  gradient = 'gradient',
  line = 'line',
  square = 'square',
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
  adminRegions = 'adminRegions',
  adminRegions1 = 'adminRegions1',
  adminRegions2 = 'adminRegions2',
  adminRegions3 = 'adminRegions3',
  adminRegions4 = 'adminRegions4',
  affectedPopulation = 'affected_population',
  alertThreshold = 'alert_threshold',
  communityNotifications = 'community_notifications',
  covidRisk = 'covid_risk',
  cropland = 'cropland',
  damSites = 'dams',
  droughtPhaseClassification = 'drought_phase_classification',
  evacuationCenters = 'evacuation_centers',
  female_head_hh = 'female_head_hh',
  flood_vulnerability_index = 'flood_vulnerability_index',
  floodExtent = 'flood_extent',
  gauges = 'gauges',
  glofasStations = 'glofas_stations',
  grassland = 'grassland',
  healthSites = 'health_sites',
  hotspotGeneral = 'Hotspot_General',
  hotspotHealth = 'Hotspot_Health',
  hotspotNutrition = 'Hotspot_Nutrition',
  hotspotWater = 'Hotspot_Water',
  housesAffected = 'houses_affected',
  ipcForecastLong = 'IPC_forecast_long',
  ipcForecastShort = 'IPC_forecast_short',
  livestockBodyCondition = 'livestock_body_condition',
  malariaRisk = 'malaria_risk',
  malariaSuitableTemperature = 'malaria_suitable_temperature',
  motorizedTravelTimeToHealth = 'motorized_travel_time_to_health',
  population = 'population',
  population_affected = 'population_affected',
  population_affected_percentage = 'population_affected_percentage',
  population_over65 = 'population_over65',
  population_u5 = 'population_u5',
  population_u8 = 'population_u8',
  populationTotal = 'populationTotal',
  potentialCases = 'potential_cases',
  potentialCases65 = 'potential_cases_65',
  potentialCasesU5 = 'potential_cases_U5',
  potentialCasesU9 = 'potential_cases_U9',
  poverty_incidence = 'poverty_incidence',
  probWithin50Km = 'prob_within_50km',
  rainfall = 'rainfall',
  rainfallExtent = 'rainfall_extent',
  rainfallForecast = 'rainfall_forecast',
  redCrossBranches = 'red_cross_branches',
  roads = 'roads',
  roof_type = 'roof_type',
  schools = 'schools',
  totalHouses = 'total_houses',
  totalIdps = 'total_idps',
  travel_time_cities = 'travel_time_cities',
  typhoonTrack = 'typhoon_track',
  vegetationCondition = 'vegetation_condition',
  vulnerability_score = 'vulnerability_score',
  vulnerableGroup = 'vulnerable_group',
  vulnerableHousing = 'vulnerable_housing',
  walkingTravelTimeToHealth = 'walking_travel_time_to_health',
  wall_type = 'wall_type',
  waterpoints = 'waterpoints',
  waterpointsInternal = 'waterpoints_internal',
  windspeed = 'windspeed',
}

export enum IbfLayerLabel {
  adminRegions1 = 'Admin Level 1',
  adminRegions2 = 'Admin Level 2',
  adminRegions3 = 'Admin Level 3',
  adminRegions4 = 'Admin Level 4',
  covidRisk = 'Covid Risk',
  cropland = 'Cropland',
  damSites = 'Dam Sites',
  evacuationCenters = 'Evacuation Centers',
  floodExtent = 'Flood extent',
  glofasStations = 'Glofas stations',
  grassland = 'Grassland',
  healthSites = 'Health Sites',
  population = 'Population',
  populationTotal = 'Total Population',
  rainfallExtent = 'Rainfall extent',
  redCrossBranches = 'Red Cross branches',
  typhoonTrack = 'Typhoon track',
  waterpoints = 'Waterpoints',
}

export class IbfLayerWMS {
  url: string;
  name: string;
  format: string;
  version: string;
  attribution: string;
  crs?: CRS;
  transparent: boolean;
  viewparams?: string;
  leadTimeDependent: boolean;
}

export enum IbfLayerGroup {
  adminRegions = 'adminRegions',
  aggregates = 'aggregates',
  outline = 'outline',
  point = 'point',
  wms = 'wms',
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
  adminBoundaryPane = 'ibf-admin-boundaries',
  aggregatePane = 'ibf-aggregate',
  outline = 'outline',
  overlayPane = 'overlayPane',
  popupPane = 'popup',
  wmsPane = 'ibf-wms',
}
