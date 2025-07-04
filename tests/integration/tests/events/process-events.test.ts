import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../helpers/utility.helper';
import { mock } from '../../helpers/utility.helper';
import { postEventsProcess } from './events.api';

export default function processEventsTests() {
  describe('process events', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const eventsProcessDto = {
      countryCodeISO3: 'UGA',
      disasterType: DisasterType.Floods,
      date: new Date(),
    };

    it('should return notification content if noNotification is true', async () => {
      // Arrange
      await mock(
        token,
        FloodsScenario.Trigger,
        DisasterType.Floods,
        'UGA',
        null,
      );

      // Act
      const result = await postEventsProcess(eventsProcessDto, true, token);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body.activeEvents.email).toBeTruthy();
    });

    it('should return void if noNotification is false', async () => {
      // Arrange
      await mock(
        token,
        FloodsScenario.Trigger,
        DisasterType.Floods,
        'UGA',
        null,
      );

      // Act
      const result = await postEventsProcess(eventsProcessDto, false, token);

      // Assert
      expect(result.status).toBe(200);
      expect(result.body).toMatchObject({});
    });
  });
}
