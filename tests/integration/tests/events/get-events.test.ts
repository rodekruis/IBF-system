import { AlertLevel } from '../../helpers/API-service/enum/alert-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, getEvents, mock } from '../../helpers/utility.helper';

const countryCodeISO3 = 'UGA';
const disasterType = DisasterType.Floods;

export default function getEventsTests() {
  describe('get events', () => {
    let accessToken: string;

    beforeAll(async () => {
      accessToken = await getAccessToken();
    });

    it('should successfully get events', async () => {
      // Arrange
      await mock(
        FloodsScenario.Trigger,
        disasterType,
        countryCodeISO3,
        new Date(),
        accessToken,
      );

      // Act
      const getEventsResult = await getEvents(
        countryCodeISO3,
        disasterType,
        accessToken,
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
