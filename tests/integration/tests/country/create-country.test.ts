import { getToken } from '@helpers/utility.helper';

import { countryData } from '../../fixtures/country.const';
import { notificationInfoData } from '../../fixtures/notification-info.const';
import {
  getCountries,
  upsertCountries,
  upsertNotificationInfo,
} from './country.api';

export default function createCountryTests() {
  describe('create or update country and notification info', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    it('should update existing country', async () => {
      // Arrange
      const countryCodeISO3 = 'MWI';
      const linkPdf = 'https://test-changed-link.com';
      const countryName = 'Malawi-different-name';

      const newCountryData = structuredClone(countryData);
      newCountryData[0].countryName = countryName;
      const newNotificationInfoData = structuredClone(notificationInfoData);
      newNotificationInfoData[0].linkPdf = linkPdf;

      // Act
      const upsertCountriesResponse = await upsertCountries(
        token,
        newCountryData,
      );
      const upsertNotificationInfoResponse = await upsertNotificationInfo(
        token,
        newNotificationInfoData,
      );

      const getCountriesResponse = await getCountries(token);
      const updatedCountry = getCountriesResponse.body.find(
        (country: { countryCodeISO3: string }) =>
          country.countryCodeISO3 === countryCodeISO3,
      );

      // Assert
      expect(upsertCountriesResponse.status).toBe(201);
      expect(upsertNotificationInfoResponse.status).toBe(201);
      expect(getCountriesResponse.status).toBe(200);
      expect(updatedCountry.countryName).toEqual(countryName);
    });

    it('should add new country', async () => {
      // Arrange
      const countryCodeISO3 = 'MWI-new-country';
      const countryName = 'Malawi-new-country';

      const newCountryData = structuredClone(countryData);
      newCountryData[0].countryCodeISO3 = countryCodeISO3;
      newCountryData[0].countryName = countryName;
      const newNotificationInfoData = structuredClone(notificationInfoData);
      newNotificationInfoData[0].countryCodeISO3 = countryCodeISO3;

      // Act
      const upsertCountriesResponse = await upsertCountries(
        token,
        newCountryData,
      );
      const upsertNotificationInfoResponse = await upsertNotificationInfo(
        token,
        newNotificationInfoData,
      );
      const getCountriesResponse = await getCountries(token);
      const newCountry = getCountriesResponse.body.find(
        (country: { countryCodeISO3: string }) =>
          country.countryCodeISO3 === countryCodeISO3,
      );

      // Assert
      expect(upsertCountriesResponse.status).toBe(201);
      expect(upsertNotificationInfoResponse.status).toBe(201);
      expect(getCountriesResponse.status).toBe(200);
      expect(newCountry.countryName).toEqual(countryName);
    });

    it('should fail to create notification-info on unkown countryCodeISO3', async () => {
      // Arrange
      const newNotificationInfoData = structuredClone(notificationInfoData);
      newNotificationInfoData[0].countryCodeISO3 = 'XXX';

      // Act
      const upsertNotificationInfoResponse = await upsertNotificationInfo(
        token,
        newNotificationInfoData,
      );

      // Assert
      expect(upsertNotificationInfoResponse.status).toBe(404);
    });
  });
}
