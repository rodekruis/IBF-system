import { test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

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
    FloodsScenario.NoTrigger,
    NoTriggerDataSet.CountryCode,
    accessToken,
  );

  await page.goto('/');
  await loginPage.login(
    NoTriggerDataSet.UserMail,
    NoTriggerDataSet.UserPassword,
  );
});
// https://app.qase.io/project/IBF?case=28&previewMode=side&suite=3
test(
  qase(
    28,
    '[No-trigger] GloFAS stations markers should be visible on "Legend", "Layer" and "Map"',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const userState = new UserStateComponent(page);
    const map = new MapComponent(page);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();
    await map.isLegendOpen({ legendOpen: true });
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.verifyLayerCheckboxCheckedByName({
      layerName: 'Glofas stations',
    });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'GloFAS No action',
    });

    // GloFAS layer should be visible by default
    await map.gloFASMarkersAreVisible();
  },
);
