import * as request from 'supertest';

import { AddCountriesDto } from './API-service/dto/create-country.dto';
import { CreateNotificationInfoDto } from './API-service/dto/create-notification-info.dto';
import { getServer } from './utility.helper';

export function addOrUpdateNotificationInfo(
  notificationInfoData: CreateNotificationInfoDto[],
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post(`/country/notification-info`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(notificationInfoData);
}

export function getCountries(
  countryCodeISO3SArray: string[],
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .get(`/country`)
    .set('Authorization', `Bearer ${accessToken}`)
    .query({ countryCodesISO3: countryCodeISO3SArray.join(',') });
}

export function addOrUpdateCountries(
  countryData: AddCountriesDto,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post(`/country`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(countryData);
}
