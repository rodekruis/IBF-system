import { AdminAreaDataIndicator } from '../../fixtures/indicators.enum';
import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { api } from '../../helpers/utility.helper';

export function getAdminAreaData(
  countryCodeISO3: string,
  adminLevel: AdminLevel,
  indicator: AdminAreaDataIndicator,
  token: string,
) {
  return api(token).get(
    `/admin-area-data/${countryCodeISO3}/${adminLevel}/${indicator}`,
  );
}

export function postAdminAreaDataUploadCsv(token: string, filePath: string) {
  return api(token)
    .post('/admin-area-data/upload/csv')
    .attach('file', filePath);
}
