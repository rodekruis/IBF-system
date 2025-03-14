import { AlertLevel } from '../../helpers/API-service/enum/alert-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { DroughtScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import {
  getAccessToken,
  getAlertAreas,
  mock,
  postSetTrigger,
  resetDB,
} from '../../helpers/utility.helper';

const countryCodeISO3 = 'UGA';
const adminLevel = 2;
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

    const getAlertAreasBeforeResult = await getAlertAreas(
      countryCodeISO3,
      adminLevel,
      disasterType,
      accessToken,
    );

    // Act
    // NOTE: this sets all areas across multiple events at once, which is not a front-end use case, but does not matter for testing the functionality
    const eventPlaceCodeIdsToSetTrigger = getAlertAreasBeforeResult.body.map(
      (alertArea) => alertArea.eventPlaceCodeId,
    );
    const setTriggerResult = await postSetTrigger(
      eventPlaceCodeIdsToSetTrigger,
      accessToken,
    );

    // Assert
    expect(setTriggerResult.status).toBe(201);
    expect(setTriggerResult.body.affected).toBe(
      eventPlaceCodeIdsToSetTrigger.length,
    );

    const getAlertAreasAfterResult = await getAlertAreas(
      countryCodeISO3,
      adminLevel,
      disasterType,
      accessToken,
    );
    for (const area of getAlertAreasBeforeResult.body) {
      expect(area.alertLevel).toBe(AlertLevel.WARNING);
    }
    for (const area of getAlertAreasAfterResult.body) {
      expect(area.alertLevel).toBe(AlertLevel.TRIGGER);
    }
  });
});
