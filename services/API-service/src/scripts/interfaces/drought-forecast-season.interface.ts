export interface DroughtSeason {
  rainMonths: number[];
  actionMonths: number[];
}

export interface DroughtForecastSeasons {
  [seasonName: string]: DroughtSeason;
}

export interface DroughtForecastSeasonAreas {
  [regionName: string]: DroughtForecastSeasons;
}
