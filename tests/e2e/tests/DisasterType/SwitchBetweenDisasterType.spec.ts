import { test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
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

test.skip(
  qase(10, 'All Disaster Types can be selected in no-trigger mode'),
  async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const userState = new UserStateComponent(page);

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
  },
);
