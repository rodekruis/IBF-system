import { countryData } from '../../fixtures/country.const';
import { notificationInfoData } from '../../fixtures/notification-info.const';
import { getNonAdminToken, getToken } from '../../helpers/utility.helper';
import {
  addOrUpdateCountries,
  addOrUpdateNotificationInfo,
} from './country.api';

export default function countryAdminAccessTests() {
  describe('country admin access control', () => {
    let adminToken: string;
    let nonAdminToken: string;

    beforeAll(async () => {
      adminToken = await getToken();
      nonAdminToken = await getNonAdminToken();
    });

    describe('POST /country - admin access required', () => {
      it('should allow admin users to create/update countries', async () => {
        // Arrange
        const testCountryData = structuredClone(countryData);

        // Act
        const result = await addOrUpdateCountries(
          { countries: testCountryData },
          adminToken,
        );

        // Assert
        expect(result.status).toBe(201);
      });

      it('should deny non-admin users access to create/update countries', async () => {
        // Arrange
        const testCountryData = structuredClone(countryData);

        // Act
        const result = await addOrUpdateCountries(
          { countries: testCountryData },
          nonAdminToken,
        );

        // Assert
        expect(result.status).toBe(403);
      });

      it('should deny unauthenticated users access to create/update countries', async () => {
        // Arrange
        const testCountryData = structuredClone(countryData);

        // Act
        const result = await addOrUpdateCountries(
          { countries: testCountryData },
          '', // empty token
        );

        // Assert
        expect(result.status).toBe(401);
      });
    });

    describe('POST /country/notification-info - admin access required', () => {
      it('should allow admin users to create/update notification info', async () => {
        // Arrange
        const testNotificationData = structuredClone(notificationInfoData);

        // Act
        const result = await addOrUpdateNotificationInfo(
          testNotificationData,
          adminToken,
        );

        // Assert
        expect(result.status).toBe(201);
      });

      it('should deny non-admin users access to create/update notification info', async () => {
        // Arrange
        const testNotificationData = structuredClone(notificationInfoData);

        // Act
        const result = await addOrUpdateNotificationInfo(
          testNotificationData,
          nonAdminToken,
        );

        // Assert
        expect(result.status).toBe(403);
      });

      it('should deny unauthenticated users access to create/update notification info', async () => {
        // Arrange
        const testNotificationData = structuredClone(notificationInfoData);

        // Act
        const result = await addOrUpdateNotificationInfo(
          testNotificationData,
          '', // empty token
        );

        // Assert
        expect(result.status).toBe(401);
      });
    });
  });
}
