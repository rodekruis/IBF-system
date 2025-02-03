import {
  TyphoonCategory,
  UploadTyphoonTrackDto,
} from '../../helpers/API-service/dto/upload-typhoon-track.dto';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { LeadTime } from '../../helpers/API-service/enum/lead-time.enum';
import { TyphoonScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import {
  getAccessToken,
  getEventsSummary,
  getTyphoonTrack,
  mockTyphoon,
  postTyphoonTrack,
  resetDB,
} from '../../helpers/utility.helper';

const countryCodeISO3 = 'PHL';
const eventName = 'Mock typhoon 1';
const sampleTyphoonTrack: UploadTyphoonTrackDto = {
  countryCodeISO3,
  leadTime: LeadTime.hour72,
  eventName,
  trackpointDetails: [
    {
      timestampOfTrackpoint: new Date('2024-12-09T06:00:00.000Z'),
      windspeed: 120,
      category: TyphoonCategory.STS,
      firstLandfall: true,
      closestToLand: false,
      lat: 12.0,
      lon: 123.0,
    },
    {
      timestampOfTrackpoint: new Date('2024-12-09T09:00:00.000Z'), // 3 hours later
      windspeed: 110,
      category: TyphoonCategory.STS,
      firstLandfall: false,
      closestToLand: true,
      lat: 12.0,
      lon: 123.0,
    },
  ],
  date: new Date(),
};

describe('typhoon track', () => {
  let accessToken: string;
  const countryCodeISO3 = 'PHL';

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  describe('typhoon track endpoints', () => {
    it('upload successfully and return expected result on GET', async () => {
      // Arrange
      await mockTyphoon(TyphoonScenario.Trigger, countryCodeISO3, accessToken);

      // Act
      const postTrackResult = await postTyphoonTrack(
        sampleTyphoonTrack,
        accessToken,
      );

      const getTrackResult = await getTyphoonTrack(
        countryCodeISO3,
        eventName,
        accessToken,
      );

      // Assert
      expect(postTrackResult.status).toBe(201);
      expect(getTrackResult.status).toBe(200);
      expect(getTrackResult.body.features.length).toBe(2);
    });
  });

  describe('get typhoon-specific event properties', () => {
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
});
