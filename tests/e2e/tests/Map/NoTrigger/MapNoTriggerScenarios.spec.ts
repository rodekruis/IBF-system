import { Page, test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { FloodsScenario } from '../../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../../helpers/utility.helper';
import LoginPage from '../../../Pages/LoginPage';

let accessToken: string;
let sharedPage: Page;

let checkedLayers;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();

  // Login
  const loginPage = new LoginPage(sharedPage);
  accessToken = await getAccessToken();
  await resetDB(accessToken);

  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    FloodsScenario.NoTrigger,
    NoTriggerDataSet.CountryCode,
    accessToken,
  );

  await sharedPage.goto('/');
  await loginPage.login(
    NoTriggerDataSet.UserMail,
    NoTriggerDataSet.UserPassword,
  );
});

// https://app.qase.io/project/IBF?case=29&previewMode=side&suite=3
test(
  qase(29, '[No-trigger] Alert Threshold Reached is visible on the legend'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

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
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Alert Threshold Reached',
    });
    // Reset state in the end of the test
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=30&previewMode=side&suite=3
test(
  qase(30, '[No-trigger] No "Alert Threshold Reached" lines are visible'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

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
    await map.assertAlertThresholdLines({ visible: false });
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=2&previewMode=side&suite=3
test(
  qase(2, 'All Map elements are present in no-trigger mode'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await map.mapComponentIsVisible();
    await map.breadCrumbViewIsVisible({ nationalView: true });
    await map.isLegendOpen({ legendOpen: true });
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.assertAdminBoundariesVisible();
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=32&previewMode=side&suite=3
test(
  qase(32, 'Check if (default) checked checkbox-layers show in map'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();
    await map.mapComponentIsVisible();

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Check if the default layers are visible
    checkedLayers = await map.returnLayerCheckedCheckboxes();
    if (checkedLayers) {
      await map.validateLayersAreVisibleByName({ layerNames: checkedLayers });
    } else {
      throw new Error('No layers are visible');
    }
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=7&previewMode=side&suite=3
test(
  qase(7, 'Verify Map functionality for no-triggered mode'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

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
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=31&previewMode=side&suite=3
test(
  qase(
    31,
    '[No-trigger] ONLY No trigger, medium warning, and low warning GloFAS stations should be visible',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();
    await map.mapComponentIsVisible();
    await map.gloFASMarkersAreVisible();
    // Assert that the max warning GloFAS markers are not visible
    await map.gloFASMarkersAreVisibleByWarning({
      glosfasStationStatus: 'glofas-station-max-trigger',
      isVisible: false,
    });
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=28&previewMode=side&suite=3
test(
  qase(
    28,
    '[No-trigger] GloFAS stations markers should be visible on "Legend", "Layer" and "Map"',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

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
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?previewMode=side&suite=3&tab=&case=33
test(
  qase(33, 'Interaction with info icon in map layer component'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();
    await map.mapComponentIsVisible();

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Assert layer info icons to be intercative and contain basic required info
    await map.validateInfoIconInteractions();
    await page.reload();
  },
);
