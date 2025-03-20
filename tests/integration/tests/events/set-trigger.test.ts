import { AlertLevel } from '../../helpers/API-service/enum/alert-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { DroughtScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import {
  getAccessToken,
  getEventsSummary,
  mock,
  postSetTrigger,
  resetDB,
} from '../../helpers/utility.helper';

const countryCodeISO3 = 'UGA';
const disasterType = DisasterType.Drought;

describe('set trigger', () => {
  let accessToken: string;

  beforeAll(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('should successfully set trigger and change alertLevel from warning to trigger', async () => {
    // Arrange
    const dateJanuary = new Date(new Date().getFullYear(), 0, 2);
    await mock(
      DroughtScenario.Warning,
      disasterType,
      countryCodeISO3,
      dateJanuary,
      accessToken,
    );

    const getEventsBeforeResult = await getEventsSummary(
      countryCodeISO3,
      disasterType,
      accessToken,
    );
    const alertAreasBefore = getEventsBeforeResult.body.flatMap(
      (event) => event.alertAreas || [],
    );
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
  });
});
