import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { LeadTime } from '../../helpers/API-service/enum/lead-time.enum';
import { api } from '../../helpers/utility.helper';

export function getAdminAreas(
  countryCodeISO3: string,
  disasterType: DisasterType,
  adminLevel: AdminLevel,
  token: string,
  leadTime?: LeadTime,
  eventName?: string,
  placeCodeParent?: string,
) {
  return api(token)
    .get(`/admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel}`)
    .query({ leadTime, eventName, placeCodeParent });
}

export function getAdminAreaAggregates(
  countryCodeISO3: string,
  disasterType: DisasterType,
  adminLevel: AdminLevel,
  token: string,
) {
  return api(token).get(
    `/admin-areas/aggregates/${countryCodeISO3}/${disasterType}/${adminLevel}`,
  );
}
