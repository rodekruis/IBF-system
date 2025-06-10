import { AlertLevel } from '../../helpers/API-service/enum/alert-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { DroughtScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../helpers/utility.helper';
import { mock, notify } from '../../helpers/utility.helper';
import { getEvents, postSetTrigger } from './events.api';

export default function setTriggerTests() {
  describe('set trigger', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'LSO';
    const disasterType = DisasterType.Drought;

    it('should successfully set trigger and change alertLevel from warning to trigger and send email', async () => {
      // Arrange
      const dateAugust = new Date(new Date().getFullYear(), 7, 2);
      await mock(
        token,
        DroughtScenario.Warning,
        disasterType,
        countryCodeISO3,
        dateAugust,
      );

      const getEventsBeforeResult = await getEvents(
        countryCodeISO3,
        disasterType,
        token,
      );
      const alertAreasBefore = getEventsBeforeResult.body[0].alertAreas;
      const eventPlaceCodeIdsToSetTrigger = alertAreasBefore.map(
        ({ eventPlaceCodeId }) => eventPlaceCodeId,
      );

      // Act
      // NOTE: this sets all areas across multiple events at once, which is not a front-end use case, but does not matter for testing the functionality
      const setTriggerResult = await postSetTrigger(
        eventPlaceCodeIdsToSetTrigger,
        countryCodeISO3,
        disasterType,
        true,
        token,
      );

      const sendNotificationResult = await notify(
        token,
        countryCodeISO3,
        disasterType,
      );

      // Assert
      expect(setTriggerResult.status).toBe(201);
      expect(setTriggerResult.body.affected).toBe(
        eventPlaceCodeIdsToSetTrigger.length,
      );

      const getEventsAfterResult = await getEvents(
        countryCodeISO3,
        disasterType,
        token,
      );
      const alertAreasAfter = getEventsAfterResult.body.flatMap(
        ({ alertAreas }) => alertAreas ?? [],
      );
      for (const area of alertAreasBefore) {
        expect(area.alertLevel).toBe(AlertLevel.WARNING);
      }
      for (const area of alertAreasAfter) {
        expect(area.alertLevel).toBe(AlertLevel.TRIGGER);
      }

      // assert email
      const emailContent = sendNotificationResult.body.activeEvents.email;
      expect(emailContent).toContain('Set by:');
      expect(emailContent).not.toContain('Forecast source:');
    });

    it('should correctly update drought events data throughout a full season cycle', async () => {
      // july warning 3-month > assert basic working
      let removeEvents = true; // set to true only for first mock to reset from previous test
      const dateJuly = new Date(new Date().getFullYear(), 6, 2);
      await mock(
        token,
        DroughtScenario.Warning,
        disasterType,
        countryCodeISO3,
        dateJuly,
        removeEvents,
      );
      const eventsJuly = await getEvents(countryCodeISO3, disasterType, token);
      expect(eventsJuly.body[0].alertLevel).toBe(AlertLevel.WARNING);

      // august no-alert 2-month > assert downgrade to no-alert
      removeEvents = false; // from now on do not overwrite events
      const dateAugust = new Date(new Date().getFullYear(), 7, 2);
      await mock(
        token,
        DroughtScenario.NoTrigger,
        disasterType,
        countryCodeISO3,
        dateAugust,
        removeEvents,
      );
      const eventsAug = await getEvents(countryCodeISO3, disasterType, token);
      expect(eventsAug.body.length).toBe(0);

      // september warning 1-month > bring back to warning and test set-trigger
      const dateSept = new Date(new Date().getFullYear(), 8, 2);
      await mock(
        token,
        DroughtScenario.Warning,
        disasterType,
        countryCodeISO3,
        dateSept,
        removeEvents,
      );
      const eventsSeptBefore = await getEvents(
        countryCodeISO3,
        disasterType,
        token,
      );
      await postSetTrigger(
        eventsSeptBefore.body[0].alertAreas.map(
          ({ eventPlaceCodeId }) => eventPlaceCodeId,
        ),
        countryCodeISO3,
        disasterType,
        true,
        token,
      );
      const eventsSeptAfter = await getEvents(
        countryCodeISO3,
        disasterType,
        token,
      );
      expect(eventsSeptAfter.body[0].alertLevel).toBe(AlertLevel.TRIGGER);

      // october warning 0-month > assert "set" trigger remains trigger despite warning pipeline forecast
      const dateOct = new Date(new Date().getFullYear(), 9, 2);
      await mock(
        token,
        DroughtScenario.Warning, // This must be warning, according to the requirement of no update during season
        disasterType,
        countryCodeISO3,
        dateOct,
        removeEvents,
      );
      const eventsOct = await getEvents(countryCodeISO3, disasterType, token);
      expect(eventsOct.body[0].alertLevel).toBe(AlertLevel.TRIGGER);

      // april no-alert 6-month > assert reset to no alert at end of season
      const dateApril = new Date(new Date().getFullYear() + 1, 3, 2);
      await mock(
        token,
        DroughtScenario.NoTrigger,
        disasterType,
        countryCodeISO3,
        dateApril,
        removeEvents,
      );
      const eventsApr = await getEvents(countryCodeISO3, disasterType, token);
      expect(eventsApr.body.length).toBe(0);
    });
  });
}
