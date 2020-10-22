import { AdminLevel } from 'src/app/types/admin-level.enum';

// tslint:disable: variable-name
export class Country {
  countryCode: string;
  defaultAdminLevel: AdminLevel;
  countryName: string;
  countryForecasts: string[];
  adminRegionLabels: string[];
}
