import { Page, test } from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import UserStateComponent from 'Pages/UserStateComponent';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

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
    FloodsScenario.NoTrigger,
    NoTriggerDataSet.CountryCode,
    accessToken,
  );

  await sharedPage.goto('/');
  await loginPage.login(
    NoTriggerDataSet.UserMail,
    NoTriggerDataSet.UserPassword,
  );
});

// https://app.qase.io/project/IBF?case=11&previewMode=side&suite=6
test(
  qase(
    11,
    'All Chat section action buttons can be selected in no-trigger mode',
  ),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const chat = new ChatComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await chat.allDefaultButtonsArePresent();
    await chat.clickAndAssertAboutButton();
    await chat.clickAndAssertGuideButton();
    await chat.clickAndAssertExportViewButton();
    await chat.clickAndAssertTriggerLogButton({
      url: `/log?countryCodeISO3=${NoTriggerDataSet.CountryCode}&disasterType=floods`,
    });
    await page.reload();
  },
);

// https://app.qase.io/project/IBF?case=5&previewMode=side&suite=6
test(
  qase(5, 'All Chat section elements are present in no-trigger mode'),
  async ({ page }) => {
    const dashboard = new DashboardPage(sharedPage);
    const userState = new UserStateComponent(sharedPage);
    const chat = new ChatComponent(sharedPage);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToFloodDisasterType();
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await chat.chatColumnIsVisibleForNoTriggerState({
      firstName: NoTriggerDataSet.firstName,
      lastName: NoTriggerDataSet.lastName,
    });
    await chat.allDefaultButtonsArePresent();
    await page.reload();
  },
);

test.afterAll(async () => {
  await sharedPage.close();
});
