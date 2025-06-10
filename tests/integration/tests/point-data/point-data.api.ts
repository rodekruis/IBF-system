import { PointIndicator } from '../../fixtures/indicators.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { api } from '../../helpers/utility.helper';

export function getPointData(
  countryCodeISO3: string,
  pointIndicator: PointIndicator,
  disasterType: DisasterType,
  token: string,
) {
  return api(token)
    .get(`/point-data/${pointIndicator}/${countryCodeISO3}`)
    .query({ disasterType });
}
