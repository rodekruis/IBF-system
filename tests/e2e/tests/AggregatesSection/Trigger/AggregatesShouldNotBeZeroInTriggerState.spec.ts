import { expect, Page, test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import DashboardPage from 'Pages/DashboardPage';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import { FloodsScenario } from '../../../../../services/API-service/src/scripts/enum/mock-scenario.enum';
import {
  getAccessToken,
  mockFloods,
  resetDB,
} from '../../../helpers/utility.helper';
import LoginPage from '../../../Pages/LoginPage';

let accessToken: string;
let sharedPage: Page;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();

  // Login
  const loginPage = new LoginPage(sharedPage);
  accessToken = await getAccessToken();
  await resetDB(accessToken);

  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    FloodsScenario.Trigger,
    TriggerDataSet.CountryCode,
    accessToken,
  );

  await sharedPage.goto('/');
  await loginPage.login(TriggerDataSet.UserMail, TriggerDataSet.UserPassword);
});

// https://app.qase.io/project/IBF?case=39&previewMode=side&suite=7
test(
  qase(39, '[Trigger] Aggregated number of events should be non-zero'),
  async ({ page }) => {
    const aggregates = new AggregatesComponent(sharedPage);
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });

    // get the number of warning events and aggregated events
    const aggregatesEventCount = await aggregates.getNumberOfPredictedEvents();

    // check if the number of warning events is equal to the number of aggregated events
    expect(aggregatesEventCount).toBeGreaterThan(0);
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?previewMode=side&suite=7&case=40
test(qase(40, '[Trigger] header colour is purple'), async ({ page }) => {
  const aggregates = new AggregatesComponent(sharedPage);
  const dashboard = new DashboardPage(sharedPage);
  const userState = new UserStateComponent(sharedPage);

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
  await page.reload();
});

test.afterAll(async () => {
  await sharedPage.close();
});
