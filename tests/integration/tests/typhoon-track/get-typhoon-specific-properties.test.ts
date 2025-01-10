import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { TyphoonScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import {
  getAccessToken,
  getEventsSummary,
  mockTyphoon,
  resetDB,
} from '../../helpers/utility.helper';

describe('get typhoon-specific properties', () => {
  let accessToken: string;
  const countryCodeISO3 = 'PHL';

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  // Here just 1 happy path is tested. See typhoon-track.service.spec for various unit tests on specific scenarios.
  it('should yield typhoonLandfall=true for scenario Trigger', async () => {
    // Arrange
    await mockTyphoon(TyphoonScenario.Trigger, countryCodeISO3, accessToken);

    // Act
    const eventsResult = await getEventsSummary(
      countryCodeISO3,
      DisasterType.Typhoon,
      accessToken,
    );

    // Assert
    expect(eventsResult.status).toBe(200);
    expect(eventsResult.body.length).toBe(1);
    expect(
      eventsResult.body[0].disasterSpecificProperties.typhoonLandfall,
    ).toBe(true);
  });
});
