import { DisasterType } from '../enum/disaster-type.enum';

export interface EventsProcessDto {
  countryCodeISO3: string;
  disasterType: DisasterType;
  readonly date: Date;
}
