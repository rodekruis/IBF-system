import { test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import { FloodsScenario } from '../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../helpers/utility.helper';
import LoginPage from '../../Pages/LoginPage';

let accessToken: string;

test.beforeEach(async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);
  accessToken = await getAccessToken();
  await resetDB(accessToken);

  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    FloodsScenario.Trigger,
    TriggerDataSet.CountryCode,
    accessToken,
  );

  await page.goto('/');
  await loginPage.login(TriggerDataSet.UserMail, TriggerDataSet.UserPassword);
});
// https://app.qase.io/project/IBF?previewMode=side&suite=3&tab=&case=37
test(
  qase(
    37,
    '[Trigger] Map layer: "Flood extent" and "Exposed population" should be active by default',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const userState = new UserStateComponent(page);
    const map = new MapComponent(page);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();

    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });
    await map.verifyLayerCheckboxCheckedByName({
      layerName: 'Flood extent',
    });
    await map.verifyLayerRadioButtonCheckedByName({
      layerName: 'Exposed population',
    });
    // Validate legend
    await map.isLegendOpen({ legendOpen: true });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Flood extent',
    });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Exposed population',
    });
    // Validatge that the layer checked with radio button is visible on the map in this case 'Exposed population' only one such layer can be checked at a time
    await map.validateAggregatePaneIsNotEmpty();
    // Validate rest of the map
    await map.validateLayerIsVisibleInMapBySrcElement({
      layerName: 'flood_extent',
    });
  },
);
