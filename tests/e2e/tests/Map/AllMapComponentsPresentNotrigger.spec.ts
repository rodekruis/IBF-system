import { test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
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
// https://app.qase.io/project/IBF?case=2&previewMode=side&suite=3
test(
  qase(2, 'All Map elements are present in no-trigger mode'),
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
    await map.mapComponentIsVisible();
    await map.breadCrumbViewIsVisible({ nationalView: true });
    await map.isLegendOpen({ legendOpen: true });
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.assertAdminBoundariesVisible();
  },
);
