import { Page, test } from '@playwright/test';
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
let sharedPage: Page;
// Instances
let dashboard: DashboardPage;
let aggregates: AggregatesComponent;
let loginPage: LoginPage;
let chat: ChatComponent;
let userState: UserStateComponent;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  // Initialize instances after sharedPage is assigned
  dashboard = new DashboardPage(sharedPage);
  aggregates = new AggregatesComponent(sharedPage);
  loginPage = new LoginPage(sharedPage);
  chat = new ChatComponent(sharedPage);
  userState = new UserStateComponent(sharedPage);

  // Login
  accessToken = await getAccessToken();
  await resetDB(accessToken);

  // We should maybe create one mock for all different disaster types for now we can just use floods
  await mockFloods(
    TriggerDataSet.TriggerScenario,
    TriggerDataSet.CountryCode,
    accessToken,
  );

  await sharedPage.goto('/');
  await loginPage.login(TriggerDataSet.UserMail, TriggerDataSet.UserPassword);
});

// AGGREGATES TRIGGER TESTS
// https://app.qase.io/project/IBF?case=39&previewMode=side&suite=7
test(
  qase(39, '[Trigger] Aggregated number of events should be non-zero'),
  async ({ page }) => {
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

// CHAT SECTION TRIGGER TESTS
// https://app.qase.io/project/IBF?case=44&previewMode=side&suite=6
test(
  qase(44, '[Trigger] Show prediction button is clickable'),
  async ({ page }) => {
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
    await chat.predictionButtonsAreActive();
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=43&previewMode=side&suite=6
test(
  qase(43, '[Trigger] Amount of  events should equal the aggregate number'),
  async ({ page }) => {
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
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=45&previewMode=side&suite=6
test(
  qase(45, '[Trigger] Info icon is clickable and opens popover'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const chat = new ChatComponent(sharedPage);

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
    await chat.validateEventsInfoButtonsAreClickable();
    await page.reload();
  },
);

test.afterAll(async () => {
  await sharedPage.close();
});
