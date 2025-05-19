import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { PointDataEnum } from '../../helpers/API-service/enum/point-data.enum';
import { api } from '../../helpers/utility.helper';

export function getPointData(
  countryCodeISO3: string,
  pointDataCategory: PointDataEnum,
  disasterType: DisasterType,
  token: string,
) {
  return api(token)
    .get(`/point-data/${pointDataCategory}/${countryCodeISO3}`)
    .query({ disasterType });
}
