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

test(
  qase(
    36,
    '[Trigger] Exposed population legend is visible when exposed population layer is active',
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
    await map.isLegendOpen({ legendOpen: true });
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });
    await map.verifyLayerRadioButtonCheckedByName({
      layerName: 'Exposed population',
    });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Exposed population',
    });
    // Exposed population layer should be visible by default in trigger mode
    // Validate that the aggregate pane is not empty after the layer is checked and loaded
    await map.validateAggregatePaneIsNotEmpty();
  },
);
