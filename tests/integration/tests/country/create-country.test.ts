import { countryData } from '../../fixtures/country.const';
import { notificationInfoData } from '../../fixtures/notification-info.const';
import { getToken } from '../../helpers/utility.helper';
import {
  addOrUpdateCountries,
  addOrUpdateNotificationInfo,
  getCountries,
} from './country.api';

export default function createCountryTests() {
  describe('create or update country and notification info', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    it('should update existing country and notification-info successfully', async () => {
      // Arrange
      const countryCodeISO3 = 'MWI';
      const newLinkPdf = 'https://test-changed-link.com';
      const newCountryName = 'Malawi-different-name';

      const newCountryData = structuredClone(countryData);
      const newNotificationInfoData = structuredClone(notificationInfoData);
      newNotificationInfoData[0].linkPdf = newLinkPdf;
      newCountryData[0].countryName = newCountryName;

      // Act
      const postCountryResult = await addOrUpdateCountries(
        { countries: newCountryData },
        token,
      );
      const postNotificationInfoResult = await addOrUpdateNotificationInfo(
        newNotificationInfoData,
        token,
      );

      const getResult = await getCountries([countryCodeISO3], token);

      // Assert
      expect(postCountryResult.status).toBe(201);
      expect(postNotificationInfoResult.status).toBe(201);
      expect(getResult.status).toBe(200);
      expect(getResult.body[0].countryName).toEqual(newCountryName);
      expect(getResult.body[0].notificationInfo.linkPdf).toEqual(newLinkPdf);
    });

    it('should add new country and notification-info successfully', async () => {
      // Arrange
      const newCountryCodeISO3 = 'MWI-new-country';
      const newCountryName = 'Malawi-new-country';

      const newCountryData = structuredClone(countryData);
      const newNotificationInfoData = structuredClone(notificationInfoData);
      newCountryData[0].countryCodeISO3 = newCountryCodeISO3;
      newCountryData[0].countryName = newCountryName;
      newNotificationInfoData[0].countryCodeISO3 = newCountryCodeISO3;

      // Act
      const postCountryResult = await addOrUpdateCountries(
        { countries: newCountryData },
        token,
      );
      const postNotificationInfoResult = await addOrUpdateNotificationInfo(
        newNotificationInfoData,
        token,
      );
      const getResult = await getCountries([newCountryCodeISO3], token);

      // Assert
      expect(postCountryResult.status).toBe(201);
      expect(postNotificationInfoResult.status).toBe(201);
      expect(getResult.status).toBe(200);
      expect(getResult.body[0].countryName).toEqual(newCountryName);
    });

    it('should fail to create notification-info on unkown countryCodeISO3', async () => {
      // Arrange
      const newNotificationInfoData = structuredClone(notificationInfoData);
      newNotificationInfoData[0].countryCodeISO3 = 'XXX';

      // Act
      const postResult = await addOrUpdateNotificationInfo(
        newNotificationInfoData,
        token,
      );

      // Assert
      expect(postResult.status).toBe(404);
    });
  });
}
