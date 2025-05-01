import { AddCountriesDto } from '../../helpers/API-service/dto/create-country.dto';
import { CreateNotificationInfoDto } from '../../helpers/API-service/dto/create-notification-info.dto';
import { api } from '../../helpers/utility.helper';

export function addOrUpdateNotificationInfo(
  notificationInfoData: CreateNotificationInfoDto[],
  token: string,
) {
  return api(token)
    .post(`/country/notification-info`)
    .send(notificationInfoData);
}

export function getCountries(countryCodeISO3SArray: string[], token: string) {
  return api(token)
    .get(`/country`)
    .query({ countryCodesISO3: countryCodeISO3SArray.join(',') });
}

export function addOrUpdateCountries(
  countryData: AddCountriesDto,
  token: string,
) {
  return api(token).post(`/country`).send(countryData);
}
