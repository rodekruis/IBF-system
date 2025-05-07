import { AdminAreaDataIndicator } from '../../fixtures/indicators.enum';
import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { api } from '../../helpers/utility.helper';

export function getAdminAreaData(
  token: string,
  countryCodeISO3: string,
  adminLevel: AdminLevel,
  indicator: AdminAreaDataIndicator,
) {
  return api(token).get(
    `/admin-area-data/${countryCodeISO3}/${adminLevel}/${indicator}`,
  );
}

interface AdminAreaDatum {
  placeCode: string;
  amount: number;
}

export function postAdminAreaData(
  token: string,
  countryCodeISO3: string,
  adminLevel: AdminLevel,
  indicator: AdminAreaDataIndicator,
  adminAreaData: AdminAreaDatum[],
) {
  return api(token)
    .post(`/admin-area-data/${countryCodeISO3}/${adminLevel}/${indicator}`)
    .send(adminAreaData);
}

export function postAdminAreaDataUploadCsv(token: string, filePath: string) {
  return api(token)
    .post('/admin-area-data/upload/csv')
    .attach('file', filePath);
}
