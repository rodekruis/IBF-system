import { Page, test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../../helpers/utility.helper';
import LoginPage from '../../../Pages/LoginPage';

let accessToken: string;
let sharedPage: Page;
// Instances
let dashboard: DashboardPage;
let aggregates: AggregatesComponent;
let map: MapComponent;
let loginPage: LoginPage;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  // Initialize instances after sharedPage is assigned
  dashboard = new DashboardPage(sharedPage);
  aggregates = new AggregatesComponent(sharedPage);
  map = new MapComponent(sharedPage);
  loginPage = new LoginPage(sharedPage);

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

test.afterAll(async () => {
  await sharedPage.close();
});
