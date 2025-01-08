import { Page, test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import UserStateComponent from 'Pages/UserStateComponent';
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
let userState: UserStateComponent;
let disasterType: DisasterTypeComponent;
let loginPage: LoginPage;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  // Initialize instances after sharedPage is assigned
  userState = new UserStateComponent(sharedPage);
  dashboard = new DashboardPage(sharedPage);
  userState = new UserStateComponent(sharedPage);
  disasterType = new DisasterTypeComponent(sharedPage);
  loginPage = new LoginPage(sharedPage);

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
