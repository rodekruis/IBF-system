import { test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregateComponenet';
import DashboardPage from 'Pages/DashboardPage';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { FloodsScenario } from '../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../../services/API-service/test/helpers/utility.helper';
import LoginPage from '../../Pages/LoginPage';

let accessToken: string;

test.beforeEach(async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);

  accessToken = await getAccessToken();
  await resetDB(accessToken);
  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    FloodsScenario.NoTrigger,
    NoTriggerDataSet.CountryCode,
    accessToken,
  );

  await page.goto('/');
  await loginPage.login(
    NoTriggerDataSet.UserMail,
    NoTriggerDataSet.UserPassword,
  );
});

test('[30588] All Aggregate elements are present in no-trigger mode', async ({
  page,
}) => {
  const dashboard = new DashboardPage(page);
  const aggregates = new AggregatesComponent(page);

  // Navigate to disaster type the data was mocked for
  await dashboard.navigateToFloodDisasterType();
  // Assertions
  await aggregates.aggregateComponentIsVisible();
  await aggregates.aggregatesAlementsDisplayedInNoTrigger();
});