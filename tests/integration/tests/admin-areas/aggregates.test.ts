import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { mock } from '../../helpers/utility.helper';
import { getToken } from '../../helpers/utility.helper';
import { getAdminAreaAggregates } from './admin-areas.api';

export default function adminAreaAggregatesTests() {
  describe('admin areas', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'UGA';
    const disasterType = DisasterType.Floods;
    const adminLevel = AdminLevel.adminLevel3;
    const scenario = FloodsScenario.Trigger;

    it('should return list of admin area aggregates on GET', async () => {
      // Arrange
      await mock(token, scenario, disasterType, countryCodeISO3, null);

      // Act
      const adminAreaAggregates = await getAdminAreaAggregates(
        countryCodeISO3,
        disasterType,
        adminLevel,
        token,
      );

      // Assert
      expect(adminAreaAggregates.status).toBe(200);
      expect(adminAreaAggregates.body.length).toBe(12); // we expect 12 aggregates from the mock data

      const adminAreaAggregate = adminAreaAggregates.body[0]; // test the first aggregate
      expect(adminAreaAggregate.placeCode).toMatch(/^(?:UG|G)/); // placeCode should start with 'UG' for Uganda
      expect(adminAreaAggregate.indicator).toBeTruthy(); // the indicator should not be empty
      expect(adminAreaAggregate.value).toEqual(expect.any(Number));
    });
  });
}
