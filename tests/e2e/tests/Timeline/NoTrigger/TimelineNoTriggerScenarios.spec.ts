import { Page, test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import TimelineComponent from 'Pages/TimelineComponent';
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
let timeline: TimelineComponent;
let loginPage: LoginPage;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  // Initialize instances after sharedPage is assigned
  dashboard = new DashboardPage(sharedPage);
  userState = new UserStateComponent(sharedPage);
  timeline = new TimelineComponent(sharedPage);
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

test.afterAll(async () => {
  await sharedPage.close();
});
