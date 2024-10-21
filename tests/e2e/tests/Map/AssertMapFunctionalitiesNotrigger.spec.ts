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

test(
  qase(7, 'Verify Map functionality for no-triggered mode'),
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

    // Close the legend
    await map.isLegendOpen({ legendOpen: true });
    await map.clickLegendHeader();
    await map.isLegendOpen({ legendOpen: false });

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Select and deselect the layer
    await map.clickLayerMenu();
    await map.clickLayerCheckbox({ layerName: 'Red Cross branches' });
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Red Cross branches layer should be visible
    await map.redCrossMarkersAreVisible();
  },
);
