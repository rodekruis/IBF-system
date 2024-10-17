import { test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponet';
import DashboardPage from 'Pages/DashboardPage';
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

test(
  qase(13, 'All Aggregate info buttons show on click information'),
  async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const aggregates = new AggregatesComponent(page);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await aggregates.validatesAggregatesInfoButtons();
  },
);
