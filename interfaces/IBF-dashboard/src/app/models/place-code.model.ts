import { AdminLevel } from '../types/admin-level';

export class PlaceCode {
  countryCodeISO3: string;
  placeCode: string;
  placeCodeName: string;
  placeCodeParent?: PlaceCode;
  placeCodeParentName: string;
  eventName?: string;
  adminLevel?: AdminLevel;
}
