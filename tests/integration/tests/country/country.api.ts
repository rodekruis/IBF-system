import { CountryDto } from '@helpers/API-service/dto/country.dto';
import { CreateNotificationInfoDto } from '@helpers/API-service/dto/create-notification-info.dto';
import { api } from '@helpers/utility.helper';

export function upsertNotificationInfo(
  token: string,
  notificationInfoData: CreateNotificationInfoDto[],
) {
  return api(token)
    .post(`/country/notification-info`)
    .send(notificationInfoData);
}

export function getCountries(token: string) {
  return api(token).get(`/country`);
}

export function upsertCountries(token: string, countries: CountryDto[]) {
  return api(token).post(`/country`).send({ countries });
}
