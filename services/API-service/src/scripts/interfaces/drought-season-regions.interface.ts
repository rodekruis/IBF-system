export interface DroughtSeason {
  rainMonths: number[];
  actionMonths: number[];
}

export interface DroughtSeasons {
  [seasonName: string]: DroughtSeason;
}

export interface DroughtSeasonRegions {
  [regionName: string]: DroughtSeasons;
}
