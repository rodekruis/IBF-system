export enum AdminAreaDataIndicator {
  female_head_hh = 'female_head_hh',
  flood_vulnerability_index = 'flood_vulnerability_index',
  hotspotGeneral = 'Hotspot_General',
  hotspotHealth = 'Hotspot_Health',
  hotspotWater = 'Hotspot_Water',
  ipcForecastLong = 'IPC_forecast_long',
  ipcForecastShort = 'IPC_forecast_short',
  malariaRisk = 'malaria_risk',
  malariaSuitableTemperature = 'malaria_suitable_temperature',
  motorizedTravelTimeToHealth = 'motorized_travel_time_to_health',
  population_over65 = 'population_over65',
  population_u5 = 'population_u5',
  population_u8 = 'population_u8',
  populationTotal = 'populationTotal',
  poverty_incidence = 'poverty_incidence',
  roof_type = 'roof_type',
  totalHouses = 'total_houses',
  totalIdps = 'total_idps',
  travel_time_cities = 'travel_time_cities',
  vulnerableGroup = 'vulnerable_group',
  vulnerableHousing = 'vulnerable_housing',
  walkingTravelTimeToHealth = 'walking_travel_time_to_health',
  wall_type = 'wall_type',
}

export enum AdminAreaDynamicDataIndicator {
  affectedPopulation = 'affected_population',
  droughtPhaseClassification = 'drought_phase_classification',
  forecastSeverity = 'forecast_severity',
  forecastTrigger = 'forecast_trigger',
  housesAffected = 'houses_affected',
  livestockBodyCondition = 'livestock_body_condition',
  population_affected = 'population_affected',
  population_affected_percentage = 'population_affected_percentage',
  potentialCases = 'potential_cases',
  potentialCases65 = 'potential_cases_65',
  potentialCasesU5 = 'potential_cases_U5',
  vegetationCondition = 'vegetation_condition',
}

export enum PointIndicator {
  communityNotifications = 'community_notifications',
  dams = 'dams',
  evacuationCenters = 'evacuation_centers',
  gauges = 'gauges',
  glofasStations = 'glofas_stations',
  healthSites = 'health_sites',
  redCrossBranches = 'red_cross_branches',
  schools = 'schools',
  waterpointsInternal = 'waterpoints_internal',
}

export enum LineIndicator {
  roads = 'roads',
}

enum _Indicator {
  floodExtent = 'flood_extent',
  grassland = 'grassland',
  hotspotNutrition = 'Hotspot_Nutrition',
  population = 'population',
  potentialCasesU9 = 'potential_cases_U9',
  probWithin50Km = 'prob_within_50km',
  rainfall = 'rainfall',
  rainfallForecast = 'rainfall_forecast',
  trigger = 'trigger',
  typhoonTrack = 'typhoon_track',
  vulnerability_score = 'vulnerability_score',
  waterpoints = 'waterpoints',
  windspeed = 'windspeed',
}
