import { AdminLevel } from 'src/app/types/admin-level';

export class PlaceCode {
  countryCodeISO3: string;
  placeCode: string;
  placeCodeName: string;
  placeCodeParent?: PlaceCode;
  placeCodeParentName: string;
  eventName?: string;
  adminLevel?: AdminLevel;
}
