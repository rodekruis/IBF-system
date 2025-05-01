import { AlertLevel } from '../../helpers/API-service/enum/alert-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../helpers/utility.helper';
import { mock } from '../../helpers/utility.helper';
import { getEvents } from './events.api';

export default function getEventsTests() {
  describe('get events', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'UGA';
    const disasterType = DisasterType.Floods;

    it('should successfully get events', async () => {
      // Arrange
      await mock(
        token,
        FloodsScenario.Trigger,
        disasterType,
        countryCodeISO3,
        new Date(),
      );

      // Act
      const getEventsResult = await getEvents(
        countryCodeISO3,
        disasterType,
        token,
      );
      const events = getEventsResult.body;

      // Assert
      expect(getEventsResult.status).toBe(200);
      expect(events.length).toBe(3); // FloodsScenario.Trigger comes with 3 events
      for (const event of events) {
        expect(event.firstLeadTime).not.toBeNull();
        for (const alertArea of event.alertAreas) {
          expect(alertArea.alertLevel).toBe(event.alertLevel);
          if (event.alertLevel !== AlertLevel.TRIGGER) {
            expect(alertArea.eapActions.length).toBe(0);
          }
        }
      }
    });
  });
}
