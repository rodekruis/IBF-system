import { test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

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
    NoTriggerDataSet.NoTriggerScenario,
    NoTriggerDataSet.CountryCode,
    accessToken,
  );

  await page.goto('/');
  await loginPage.login(
    NoTriggerDataSet.UserMail,
    NoTriggerDataSet.UserPassword,
  );
});
// The test is skipped because of the bug that was identified during writing of this test
// The bug is that the marker of glofas stations cannot be disabled with the first chebox click (needs several) and it is failing on flood disaster type
// https://github.com/rodekruis/IBF-system/issues/1657
// When the bug is fixed, the test should be unskipped
test.skip(
  qase(
    12,
    'Aggregates title should be dynamic upon hovering over map district',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const aggregates = new AggregatesComponent(page);
    const map = new MapComponent(page);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await map.clickLayerCheckbox({ layerName: 'Glofas stations' });
    await map.assertAggregateTitleOnHoverOverMap();
  },
);
