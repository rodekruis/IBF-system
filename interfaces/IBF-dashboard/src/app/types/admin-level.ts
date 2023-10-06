export enum AdminLevel {
  adminLevel1 = 1,
  adminLevel2 = 2,
  adminLevel3 = 3,
  adminLevel4 = 4,
}

export enum AdminLevelType {
  single = 'single',
  deepest = 'deepest',
}

export class AdminLevelLabel {
  adminLevel1: string;
  adminLevel2: string;
  adminLevel3: string;
  adminLevel4: string;
}
