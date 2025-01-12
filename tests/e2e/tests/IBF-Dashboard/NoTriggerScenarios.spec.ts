import { Page, test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
import TimelineComponent from 'Pages/TimelineComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../helpers/utility.helper';
import LoginPage from '../../Pages/LoginPage';

let accessToken: string;
let sharedPage: Page;
// layers
let checkedLayers;
// Instances
let dashboard: DashboardPage;
let aggregates: AggregatesComponent;
let map: MapComponent;
let loginPage: LoginPage;
let chat: ChatComponent;
let userState: UserStateComponent;
let disasterType: DisasterTypeComponent;
let timeline: TimelineComponent;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  // Initialize instances after sharedPage is assigned
  dashboard = new DashboardPage(sharedPage);
  aggregates = new AggregatesComponent(sharedPage);
  map = new MapComponent(sharedPage);
  loginPage = new LoginPage(sharedPage);
  chat = new ChatComponent(sharedPage);
  userState = new UserStateComponent(sharedPage);
  disasterType = new DisasterTypeComponent(sharedPage);
  timeline = new TimelineComponent(sharedPage);

  // Login
  accessToken = await getAccessToken();
  await resetDB(accessToken);

  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    NoTriggerDataSet.NoTriggerScenario,
    NoTriggerDataSet.CountryCode,
    accessToken,
  );

  await sharedPage.goto('/');
  await loginPage.login(
    NoTriggerDataSet.UserMail,
    NoTriggerDataSet.UserPassword,
  );
});

test.beforeEach(async () => {
  await dashboard.waitForPageToBeLoadedAndStable();
});

// AGGREGATES NO-TRIGGER TESTS
test(
  qase(
    12,
    'Aggregates title should be dynamic upon hovering over map district',
  ),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await map.clickLayerCheckbox({ layerName: 'Glofas stations' });
    await map.assertAggregateTitleOnHoverOverMap();
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=6&previewMode=side&suite=7
test(
  qase(6, 'All Aggregate elements are present in no-trigger mode'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await aggregates.aggregatesAlementsDisplayedInNoTrigger();
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=13&previewMode=side&suite=7
test(
  qase(13, 'All Aggregate info buttons show on click information'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await aggregates.validatesAggregatesInfoButtons();
    await aggregates.validateLayerPopoverExternalLink();
    await page.reload();
  },
);

// CHAT SECTION NO-TRIGGER TESTS
// https://app.qase.io/project/IBF?case=11&previewMode=side&suite=6
test(
  qase(
    11,
    'All Chat section action buttons can be selected in no-trigger mode',
  ),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await chat.allDefaultButtonsArePresent();
    await chat.clickAndAssertAboutButton();
    await chat.clickAndAssertGuideButton();
    await chat.clickAndAssertExportViewButton();
    await chat.clickAndAssertTriggerLogButton({
      url: `/log?countryCodeISO3=${NoTriggerDataSet.CountryCode}&disasterType=floods`,
    });
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=5&previewMode=side&suite=6
test(
  qase(5, 'All Chat section elements are present in no-trigger mode'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await chat.chatColumnIsVisibleForNoTriggerState({
      firstName: NoTriggerDataSet.firstName,
      lastName: NoTriggerDataSet.lastName,
    });
    await chat.allDefaultButtonsArePresent();
    await page.reload();
  },
);

// DASHBOARD NO-TRIGGER TESTS
// https://app.qase.io/project/IBF?case=1&previewMode=side&suite=2
test(
  qase(1, 'All Dashboard elements are present in no-trigger mode'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await disasterType.topBarComponentIsVisible();
    await chat.chatColumnIsVisibleForNoTriggerState({
      firstName: NoTriggerDataSet.firstName,
      lastName: NoTriggerDataSet.lastName,
    });
    await aggregates.aggregateComponentIsVisible();
    await map.mapComponentIsVisible();
    await page.reload();
  },
);

// DISASTER TYPE NO-TRIGGER TESTS
// https://app.qase.io/project/IBF?case=4&previewMode=side&suite=5
test(
  qase(4, 'All Disaster Type elements are present in no-trigger mode'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await disasterType.topBarComponentIsVisible();
    await disasterType.allDisasterTypeElementsArePresent();
    await page.reload();
  },
);

// Test is skipped because it was flaky and more invastigation is needed to fix it
// Logged in PBI: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/32127/
// https://app.qase.io/project/IBF?case=4&previewMode=side&suite=5
test.skip(
  qase(10, 'All Disaster Types can be selected in no-trigger mode'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);

    // Navigate between disaster types no matter the mock data
    await dashboard.navigateToFloodDisasterType();
    await userState.headerComponentDisplaysCorrectDisasterType({
      countryName: NoTriggerDataSet.CountryName,
      disasterName: 'floods',
    });

    await dashboard.navigateToDroughtDisasterType();
    await userState.headerComponentDisplaysCorrectDisasterType({
      countryName: NoTriggerDataSet.CountryName,
      disasterName: 'drought',
    });

    await dashboard.navigateToHeavyRainDisasterType();
    await userState.headerComponentDisplaysCorrectDisasterType({
      countryName: NoTriggerDataSet.CountryName,
      disasterName: 'heavy-rain',
    });
    await page.reload();
  },
);

// MAP NO-TRIGGER TESTS
// https://app.qase.io/project/IBF?case=29&previewMode=side&suite=3
test(
  qase(29, '[No-trigger] Alert Threshold Reached is visible on the legend'),
  async ({ page }) => {
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

// TIMELINE NO-TRIGGER TESTS
// https://app.qase.io/project/IBF?case=15&previewMode=side&suite=9
test(qase(15, 'Timeline present in no trigger mode'), async ({ page }) => {
  // Navigate to disaster type the data was mocked for
  await dashboard.navigateToFloodDisasterType();
  // Assertions
  await userState.headerComponentIsVisible({
    countryName: NoTriggerDataSet.CountryName,
  });
  await timeline.timlineElementsAreVisible();
  await page.reload();
});

// https://app.qase.io/project/IBF?case=14&previewMode=side&suite=9
test(
  qase(14, 'Timeline is deactivated in no-trigger mode'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await timeline.timelineIsInactive();
    await page.reload();
  },
);

// USER STATE NO-TRIGGER TESTS
// https://app.qase.io/project/IBF?case=3&previewMode=side&suite=4
test(
  qase(3, 'All User State elements are present in no-trigger mode'),
  async ({ page }) => {
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await userState.allUserStateElementsAreVisible({
      firstName: NoTriggerDataSet.firstName,
      lastName: NoTriggerDataSet.lastName,
    });
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=8&previewMode=side&suite=4
test(qase(4, 'Log out from IBF-system'), async ({ page }) => {
  // Navigate to disaster type the data was mocked for
  await dashboard.navigateToFloodDisasterType();
  // Assertions
  await userState.headerComponentIsVisible({
    countryName: NoTriggerDataSet.CountryName,
  });
  await userState.logOut();
  await loginPage.loginScreenIsVisible();
  await page.reload();
});

test.afterAll(async () => {
  await sharedPage.close();
});
