import { Page, test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../../helpers/utility.helper';
import LoginPage from '../../../Pages/LoginPage';

let accessToken: string;
let sharedPage: Page;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();

  // Login
  const loginPage = new LoginPage(sharedPage);
  accessToken = await getAccessToken();
  await resetDB(accessToken);

  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    TriggerDataSet.TriggerScenario,
    TriggerDataSet.CountryCode,
    accessToken,
  );

  await sharedPage.goto('/');
  await loginPage.login(TriggerDataSet.UserMail, TriggerDataSet.UserPassword);
});

// https://app.qase.io/project/IBF?previewMode=side&suite=3&tab=&case=37
test(
  qase(
    37,
    '[Trigger] Map layer: "Flood extent" and "Exposed population" should be active by default',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    // Wait for the sharedPage to load
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
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?previewMode=side&suite=3&tab=&case=35
test(
  qase(
    35,
    '[Trigger] Flood extent legend is visible when flood extent layer is active',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    // Wait for the sharedPage to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();
    await map.isLegendOpen({ legendOpen: true });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Flood extent',
    });
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=38&previewMode=side&suite=3
test(
  qase(
    38,
    '[Trigger] At least one red/orange/yellow GloFAS station should be visible',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const map = new MapComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    // Wait for the sharedPage to load
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

    // At least one red/orange/yellow GloFAS station should be visible by default in trigger mode
    await map.gloFASMarkersAreVisibleByWarning({
      glosfasStationStatus: 'glofas-station-max-trigger',
      isVisible: true,
    });
    await page.reload();
  },
);

test.afterAll(async () => {
  await sharedPage.close();
});
