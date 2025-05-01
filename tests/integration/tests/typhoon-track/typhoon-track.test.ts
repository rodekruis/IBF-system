import {
  TyphoonCategory,
  UploadTyphoonTrackDto,
} from '../../helpers/API-service/dto/upload-typhoon-track.dto';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { LeadTime } from '../../helpers/API-service/enum/lead-time.enum';
import { TyphoonScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { mock } from '../../helpers/utility.helper';
import { getToken } from '../../helpers/utility.helper';
import { getEvents } from '../events/events.api';
import { getTyphoonTrack, postTyphoonTrack } from './typhoon-track.api';

export default function typhoonTrackTests() {
  describe('typhoon track', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

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

    it('upload successfully and return expected result on GET', async () => {
      // Arrange
      await mock(
        TyphoonScenario.Trigger,
        DisasterType.Typhoon,
        countryCodeISO3,
        null,
        token,
      );

      // Act
      const postTrackResult = await postTyphoonTrack(sampleTyphoonTrack, token);

      const getTrackResult = await getTyphoonTrack(
        countryCodeISO3,
        eventName,
        token,
      );

      // Assert
      expect(postTrackResult.status).toBe(201);
      expect(getTrackResult.status).toBe(200);
      expect(getTrackResult.body.features.length).toBe(2);
    });

    it('should yield typhoonLandfall=true for scenario Trigger', async () => {
      // Arrange
      await mock(
        TyphoonScenario.Trigger,
        DisasterType.Typhoon,
        countryCodeISO3,
        null,
        token,
      );

      // Act
      const eventsResult = await getEvents(
        countryCodeISO3,
        DisasterType.Typhoon,
        token,
      );

      // Assert
      expect(eventsResult.status).toBe(200);
      expect(eventsResult.body.length).toBe(1);
      expect(
        eventsResult.body[0].disasterSpecificProperties.typhoonLandfall,
      ).toBe(true);
    });
  });
}
