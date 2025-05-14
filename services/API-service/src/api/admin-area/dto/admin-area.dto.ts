import { AdminLevel } from '../../country/admin-level.enum';

export interface AdminAreaParams {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
}
