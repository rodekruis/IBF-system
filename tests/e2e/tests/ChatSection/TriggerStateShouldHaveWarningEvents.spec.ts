import { expect, test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
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
// https://app.qase.io/project/IBF?case=43&previewMode=side&suite=6
test(
  qase(43, '[Trigger] Amount of  events should equal the aggregate number'),
  async ({ page }) => {
    const aggregates = new AggregatesComponent(page);
    const dashboard = new DashboardPage(page);
    const userState = new UserStateComponent(page);
    const chat = new ChatComponent(page);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    await chat.chatColumnIsVisibleForTriggerState({
      firstName: TriggerDataSet.firstName,
      lastName: TriggerDataSet.lastName,
    });
    await chat.allDefaultButtonsArePresent();

    // get the number of warning events and aggregated events
    const chatEventCount = await chat.predictionButtonsAreActive();
    const aggregatesEventCount = await aggregates.getNumberOfPredictedEvents();

    // check if the number of warning events is equal to the number of aggregated events
    expect(chatEventCount).toEqual(aggregatesEventCount);
  },
);
