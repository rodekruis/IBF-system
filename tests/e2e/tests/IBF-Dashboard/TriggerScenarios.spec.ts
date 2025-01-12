import { expect, Page, test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../helpers/utility.helper';
import LoginPage from '../../Pages/LoginPage';

let accessToken: string;
let sharedPage: Page;
// Instances
let dashboard: DashboardPage;
let aggregates: AggregatesComponent;
let loginPage: LoginPage;
let chat: ChatComponent;
let userState: UserStateComponent;
let map: MapComponent;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  // Initialize instances after sharedPage is assigned
  dashboard = new DashboardPage(sharedPage);
  aggregates = new AggregatesComponent(sharedPage);
  loginPage = new LoginPage(sharedPage);
  chat = new ChatComponent(sharedPage);
  userState = new UserStateComponent(sharedPage);
  map = new MapComponent(sharedPage);

  // Login
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

test.beforeEach(async () => {
  await dashboard.waitForPageToBeLoadedAndStable();
});

// AGGREGATES TRIGGER TESTS
// https://app.qase.io/project/IBF?case=39&previewMode=side&suite=7
test(
  qase(39, '[Trigger] Aggregated number of events should be non-zero'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });

    // get the number of warning events and aggregated events
    const aggregatesEventCount = await aggregates.getNumberOfPredictedEvents();

    // check if the number of warning events is equal to the number of aggregated events
    expect(aggregatesEventCount).toBeGreaterThan(0);
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?previewMode=side&suite=7&case=40
test(qase(40, '[Trigger] header colour is purple'), async ({ page }) => {
  // Navigate to disaster type the data was mocked for
  await dashboard.navigateToFloodDisasterType();
  // Assertions
  await userState.headerComponentIsVisible({
    countryName: TriggerDataSet.CountryName,
  });

  // Validate that the aggregates header is purple by class
  await aggregates.validateColorOfAggregatesHeaderByClass({
    isTrigger: true,
  });
  await page.reload();
});

// CHAT SECTION TRIGGER TESTS
// https://app.qase.io/project/IBF?case=44&previewMode=side&suite=6
test(
  qase(44, '[Trigger] Show prediction button is clickable'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    await chat.chatColumnIsVisibleForTriggerState({
      firstName: TriggerDataSet.firstName,
      lastName: TriggerDataSet.lastName,
    });
    await chat.allDefaultButtonsArePresent();
    await chat.predictionButtonsAreActive();
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=43&previewMode=side&suite=6
test(
  qase(43, '[Trigger] Amount of  events should equal the aggregate number'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    await chat.chatColumnIsVisibleForTriggerState({
      firstName: TriggerDataSet.firstName,
      lastName: TriggerDataSet.lastName,
    });
    await chat.allDefaultButtonsArePresent();

    // get the number of warning events and aggregated events
    const chatEventCount = await chat.predictionButtonsAreActive();
    const aggregatesEventCount = await aggregates.getNumberOfPredictedEvents();

    // check if the number of warning events is equal to the number of aggregated events
    expect(chatEventCount).toEqual(aggregatesEventCount);
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=45&previewMode=side&suite=6
test(
  qase(45, '[Trigger] Info icon is clickable and opens popover'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const chat = new ChatComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    await chat.chatColumnIsVisibleForTriggerState({
      firstName: TriggerDataSet.firstName,
      lastName: TriggerDataSet.lastName,
    });
    await chat.validateEventsInfoButtonsAreClickable();
    await page.reload();
  },
);

// MAP TRIGGER TESTS
// https://app.qase.io/project/IBF?previewMode=side&suite=3&tab=&case=37
test(
  qase(
    37,
    '[Trigger] Map layer: "Flood extent" and "Exposed population" should be active by default',
  ),
  async ({ page }) => {
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
