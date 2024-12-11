import { TyphoonScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import {
  getAccessToken,
  getTyphoonTrack,
  mockTyphoon,
  postTyphoonTrack,
  resetDB,
} from '../../helpers/utility.helper';
import { LeadTime } from '../../../../services/API-service/src/api/admin-area-dynamic-data/enum/lead-time.enum';
import { UploadTyphoonTrackDto } from '../../../../services/API-service/src/api/typhoon-track/dto/upload-typhoon-track';
import { TyphoonCategory } from '../../../../services/API-service/src/api/typhoon-track/dto/trackpoint-details';

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

describe('upload typhoon track', () => {
  let accessToken: string;
  const countryCodeISO3 = 'PHL';

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('upload successfully and return expected result on GET', async () => {
    // Arrange
    await mockTyphoon(
      TyphoonScenario.EventTrigger,
      countryCodeISO3,
      accessToken,
    );

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
