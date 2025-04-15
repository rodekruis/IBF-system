import * as request from 'supertest';

import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, getServer, mock } from '../../helpers/utility.helper';

export function getAdminAreaAggregates(
  countryCodeISO3: string,
  disasterType: DisasterType,
  adminLevel: AdminLevel,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .get(
      `/admin-areas/aggregates/${countryCodeISO3}/${disasterType}/${adminLevel}`,
    )
    .set('Authorization', `Bearer ${accessToken}`);
}

export default function adminAreaAggregatesTests() {
  const countryCodeISO3 = 'UGA';
  const disasterType = DisasterType.Floods;
  const adminLevel = AdminLevel.adminLevel3;
  const scenario = FloodsScenario.Trigger;

  describe('admin areas', () => {
    let accessToken: string;

    beforeAll(async () => {
      accessToken = await getAccessToken();
    });

    it('should return list of admin area aggregates on GET', async () => {
      // Arrange
      await mock(scenario, disasterType, countryCodeISO3, null, accessToken);

      // Act
      const adminAreaAggregates = await getAdminAreaAggregates(
        countryCodeISO3,
        disasterType,
        adminLevel,
        accessToken,
      );

      // Assert
      expect(adminAreaAggregates.status).toBe(200);
      expect(adminAreaAggregates.body.length).toBe(138); // we expect 138 aggregates from the mock data

      const adminAreaAggregate = adminAreaAggregates.body[0]; // test the first aggregate
      expect(adminAreaAggregate.placeCode).toMatch(/^UG/); // placeCode should start with 'UG' for Uganda
      expect(adminAreaAggregate.indicator).toBeTruthy(); // the indicator should not be empty
      expect(adminAreaAggregate.value).toEqual(expect.any(Number));
    });
  });
}
