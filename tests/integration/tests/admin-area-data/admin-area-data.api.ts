import { readFileSync } from 'fs';

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

export function postAdminAreaDataUploadJson(token: string, filePath: string) {
  const json = readFileSync(filePath, 'utf8');
  if (!json || json.length === 0) {
    throw new Error(`Invalid file: ${filePath}`);
  }

  // parse the JSON string into a JSON object
  let parsedJson: JSON;

  try {
    parsedJson = JSON.parse(json);
  } catch (error) {
    throw new Error(`Error parsing JSON from file: ${filePath}`);
  }

  return api(token).post('/admin-area-data/upload/json').send(parsedJson);
}
