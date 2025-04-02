import { AlertLevel } from '../../helpers/API-service/enum/alert-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { DroughtScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import {
  getAccessToken,
  getEventsSummary,
  mock,
  postSetTrigger,
  resetDB,
  sendNotification,
} from '../../helpers/utility.helper';

const countryCodeISO3 = 'LSO';
const disasterType = DisasterType.Drought;

describe('set trigger', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('should successfully set trigger and change alertLevel from warning to trigger and send email', async () => {
    // Arrange
    const dateAugust = new Date(new Date().getFullYear(), 7, 2);
    await mock(
      DroughtScenario.Warning,
      disasterType,
      countryCodeISO3,
      dateAugust,
      accessToken,
    );

    const getEventsBeforeResult = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    const alertAreasBefore = getEventsBeforeResult.body[0].alertAreas;
    const eventPlaceCodeIdsToSetTrigger = alertAreasBefore.map(
      (alertArea) => alertArea.eventPlaceCodeId,
    );

    // Act
    // NOTE: this sets all areas across multiple events at once, which is not a front-end use case, but does not matter for testing the functionality
    const setTriggerResult = await postSetTrigger(
      eventPlaceCodeIdsToSetTrigger,
      countryCodeISO3,
      disasterType,
      true,
      accessToken,
    );

    const sendNotificationResult = await sendNotification(
      countryCodeISO3,
      disasterType,
      accessToken,
    );

    // Assert
    expect(setTriggerResult.status).toBe(201);
    expect(setTriggerResult.body.affected).toBe(
      eventPlaceCodeIdsToSetTrigger.length,
    );

    const getEventsAfterResult = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    const alertAreasAfter = getEventsAfterResult.body.flatMap(
      (event) => event.alertAreas || [],
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
      DroughtScenario.Warning,
      disasterType,
      countryCodeISO3,
      dateJuly,
      accessToken,
      removeEvents,
    );
    const eventsJuly = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    expect(eventsJuly.body[0].alertLevel).toBe(AlertLevel.WARNING);

    // august no-alert 2-month > assert downgrade to no-alert
    removeEvents = false; // from now on do not overwrite events
    const dateAugust = new Date(new Date().getFullYear(), 7, 2);
    await mock(
      DroughtScenario.NoTrigger,
      disasterType,
      countryCodeISO3,
      dateAugust,
      accessToken,
      removeEvents,
    );
    const eventsAug = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    expect(eventsAug.body.length).toBe(0);

    // september warning 1-month > bring back to warning and test set-trigger
    const dateSept = new Date(new Date().getFullYear(), 8, 2);
    await mock(
      DroughtScenario.Warning,
      disasterType,
      countryCodeISO3,
      dateSept,
      accessToken,
      removeEvents,
    );
    const eventsSeptBefore = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    await postSetTrigger(
      eventsSeptBefore.body[0].alertAreas.map((area) => area.eventPlaceCodeId),
      countryCodeISO3,
      disasterType,
      true,
      accessToken,
    );
    const eventsSeptAfter = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    expect(eventsSeptAfter.body[0].alertLevel).toBe(AlertLevel.TRIGGER);

    // october warning 0-month > assert "set" trigger remains trigger despite warning pipeline forecast
    const dateOct = new Date(new Date().getFullYear(), 9, 2);
    await mock(
      DroughtScenario.Warning, // This must be warning, according to the requirement of no update during season
      disasterType,
      countryCodeISO3,
      dateOct,
      accessToken,
      removeEvents,
    );
    const eventsOct = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    expect(eventsOct.body[0].alertLevel).toBe(AlertLevel.TRIGGER);

    // april no-alert 6-month > assert reset to no alert at end of season
    const dateApril = new Date(new Date().getFullYear() + 1, 3, 2);
    await mock(
      DroughtScenario.NoTrigger,
      disasterType,
      countryCodeISO3,
      dateApril,
      accessToken,
      removeEvents,
    );
    const eventsApr = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    expect(eventsApr.body.length).toBe(0);
  });
});
