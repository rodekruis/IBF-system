import * as request from 'supertest';

import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, getServer, mock } from '../../helpers/utility.helper';

export function getAdminAreas(
  countryCodeISO3: string,
  disasterType: DisasterType,
  adminLevel: AdminLevel,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .get(`/admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export default function adminAreaTests() {
  const countryCodeISO3 = 'UGA';
  const disasterType = DisasterType.Floods;
  const adminLevel = AdminLevel.adminLevel3;
  const scenario = FloodsScenario.Trigger;

  describe('admin areas', () => {
    let accessToken: string;

    beforeAll(async () => {
      accessToken = await getAccessToken();
    });

    it('should return list of admin areas on GET', async () => {
      // Arrange
      await mock(scenario, disasterType, countryCodeISO3, null, accessToken);

      // Act
      const adminAreas = await getAdminAreas(
        countryCodeISO3,
        disasterType,
        adminLevel,
        accessToken,
      );

      // Assert
      expect(adminAreas.status).toBe(200);
      expect(adminAreas.body.features.length).toBe(23);

      const feature = adminAreas.body.features[0];
      expect(feature.geometry.type).toBe('MultiPolygon');
      expect(feature.geometry.coordinates[0][0].length).toBeGreaterThan(0);
      expect(feature.geometry.coordinates[0][0][0].length).toBe(2);
      expect(feature.properties.placeCode).toMatch(/^UG/);
      expect(feature.properties.name).toBeTruthy();
      expect(feature.properties.adminLevel).toBe(adminLevel);
      expect(feature.properties.countryCodeISO3).toBe(countryCodeISO3);
    });
  });
}
