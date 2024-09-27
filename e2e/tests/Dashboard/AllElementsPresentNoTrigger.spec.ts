import { test } from '@playwright/test';
import AggregateComponenet from 'Pages/AggregateComponenet';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import HeaderComponent from 'Pages/HeaderComponent';
import MapComponenet from 'Pages/MapComponenet';
import TopBarComponent from 'Pages/TopBarComponent';
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

test('[30509] All Dashboard elements are present in no-trigger mode', async ({
  page,
}) => {
  const dashboard = new DashboardPage(page);
  const header = new HeaderComponent(page);
  const topBar = new TopBarComponent(page);
  const chat = new ChatComponent(page);
  const aggregate = new AggregateComponenet(page);
  const map = new MapComponenet(page);
  // Navigate to designated test country
  await dashboard.switchToCountryByName({
    countryName: NoTriggerDataSet.CountryName,
  });
  // Navigate to disaster type the data was mocked for
  await dashboard.navigateToFloodDisasterType();
  // Assertions
  await header.headerComponentIsVisible({
    countryName: NoTriggerDataSet.CountryName,
  });
  await topBar.topBarComponentIsVisible();
  await chat.chatColumnIsVisibleForNoTriggerState({
    name: NoTriggerDataSet.userName,
    surname: NoTriggerDataSet.userSurname,
  });
  await aggregate.aggregateComponentIsVisible();
  await map.mapComponentIsVisible();
});
