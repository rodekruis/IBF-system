import { Page, test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
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
// Instances
let dashboard: DashboardPage;
let aggregates: AggregatesComponent;
let map: MapComponent;
let loginPage: LoginPage;
let chat: ChatComponent;
let userState: UserStateComponent;
let disasterType: DisasterTypeComponent;

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

test.afterAll(async () => {
  await sharedPage.close();
});
