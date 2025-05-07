export enum AdminAreaDataIndicator {
  wall_type = 'wall_type',
  poverty_incidence = 'poverty_incidence',
  vulnerableHousing = 'vulnerable_housing',
  population_u5 = 'population_u5',
  flood_vulnerability_index = 'flood_vulnerability_index',
  hotspotGeneral = 'Hotspot_General',
  malariaSuitableTemperature = 'malaria_suitable_temperature',
  totalIdps = 'total_idps',
  totalHouses = 'total_houses',
  malariaRisk = 'malaria_risk',
  travel_time_cities = 'travel_time_cities',
  vulnerableGroup = 'vulnerable_group',
  population_u8 = 'population_u8',
  hotspotHealth = 'Hotspot_Health',
  ipcForecastShort = 'IPC_forecast_short',
  populationTotal = 'populationTotal',
  ipcForecastLong = 'IPC_forecast_long',
  walkingTravelTimeToHealth = 'walking_travel_time_to_health',
  motorizedTravelTimeToHealth = 'motorized_travel_time_to_health',
  population_over65 = 'population_over65',
  female_head_hh = 'female_head_hh',
  hotspotWater = 'Hotspot_Water',
  roof_type = 'roof_type',
}

export enum AdminAreaDynamicDataIndicator {
  housesAffected = 'houses_affected',
  affectedPopulation = 'affected_population',
  population_affected = 'population_affected',
  potentialCasesU5 = 'potential_cases_U5',
  forecastTrigger = 'forecast_trigger',
  droughtPhaseClassification = 'drought_phase_classification',
  livestockBodyCondition = 'livestock_body_condition',
  population_affected_percentage = 'population_affected_percentage',
  forecastSeverity = 'forecast_severity',
  vegetationCondition = 'vegetation_condition',
  potentialCases = 'potential_cases',
  potentialCases65 = 'potential_cases_65',
}

export enum PointIndicator {
  waterpointsInternal = 'waterpoints_internal',
  communityNotifications = 'community_notifications',
  evacuationCenters = 'evacuation_centers',
  healthSites = 'health_sites',
  schools = 'schools',
  damSites = 'dams',
  glofasStations = 'glofas_stations',
  redCrossBranches = 'red_cross_branches',
  gauges = 'gauges',
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
