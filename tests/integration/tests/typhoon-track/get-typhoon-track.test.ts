import { TyphoonScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import {
  getAccessToken,
  getTyphoonTrack,
  mockTyphoon,
  resetDB,
} from '../../helpers/utility.helper';

describe('get typhoon track', () => {
  let accessToken: string;
  const countryCodeISO3 = 'PHL';

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('successfully', async () => {
    // Arrange
    await mockTyphoon(
      TyphoonScenario.EventTrigger,
      countryCodeISO3,
      accessToken,
    );
    const eventName = 'Mock typhoon 1';

    // Act
    const getTrackResult = await getTyphoonTrack(
      countryCodeISO3,
      eventName,
      accessToken,
    );

    // Assert
    expect(getTrackResult.status).toBe(200);
    expect(getTrackResult.body.type).toBe('FeatureCollection');
    expect(getTrackResult.body.features.length).toBeGreaterThan(0);
    expect(
      getTrackResult.body.features[0].properties.timestampOfTrackpoint,
    ).toBeDefined();
  });
});
