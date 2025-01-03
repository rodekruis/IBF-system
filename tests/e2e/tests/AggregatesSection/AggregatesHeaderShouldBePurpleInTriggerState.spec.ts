import { test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import DashboardPage from 'Pages/DashboardPage';
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

test.beforeEach(async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);

  accessToken = await getAccessToken();
  await resetDB(accessToken);
  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    TriggerDataSet.TriggerScenario,
    TriggerDataSet.CountryCode,
    accessToken,
  );

  await page.goto('/');
  await loginPage.login(TriggerDataSet.UserMail, TriggerDataSet.UserPassword);
});
// https://app.qase.io/project/IBF?previewMode=side&suite=7&case=40
test(qase(40, '[Trigger] header colour is purple'), async ({ page }) => {
  const aggregates = new AggregatesComponent(page);
  const dashboard = new DashboardPage(page);
  const userState = new UserStateComponent(page);

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
});
