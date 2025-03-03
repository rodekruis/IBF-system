import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import {
  getAccessToken,
  mock,
  postEventsProcess,
  resetDB,
} from '../../helpers/utility.helper';

const eventsProcessDto = {
  countryCodeISO3: 'UGA',
  disasterType: DisasterType.Floods,
  date: new Date(),
};

describe('events', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  describe('process', () => {
    it('returns notification content if noNotification is true', async () => {
      // Arrange
      await mock(
        FloodsScenario.Trigger,
        DisasterType.Floods,
        'UGA',
        null,
        accessToken,
      );

      // Act
      const result = await postEventsProcess(
        eventsProcessDto,
        true,
        accessToken,
      );

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.activeEvents.email).toBeTruthy();
    });

    it('returns void if noNotification is false', async () => {
      // Arrange
      await mock(
        FloodsScenario.Trigger,
        DisasterType.Floods,
        'UGA',
        null,
        accessToken,
      );

      // Act
      const result = await postEventsProcess(
        eventsProcessDto,
        false,
        accessToken,
      );

      // Assert
      expect(result.status).toBe(200);
      expect(result.body).toMatchObject({});
    });
  });
});
