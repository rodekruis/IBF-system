import { test } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregateComponenet';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponenet from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { FloodsScenario } from '../../../services/API-service/src/scripts/enum/mock-scenario.enum';
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
  const userState = new UserStateComponent(page);
  const disasterType = new DisasterTypeComponent(page);
  const chat = new ChatComponent(page);
  const aggregates = new AggregatesComponent(page);
  const map = new MapComponenet(page);

  // Navigate to disaster type the data was mocked for
  await dashboard.navigateToFloodDisasterType();
  // Assertions
  await userState.headerComponentIsVisible({
    countryName: NoTriggerDataSet.CountryName,
  });
  await disasterType.topBarComponentIsVisible();
  await chat.chatColumnIsVisibleForNoTriggerState({
    firstName: NoTriggerDataSet.firstName,
    lastName: NoTriggerDataSet.lastName,
  });
  await aggregates.aggregateComponentIsVisible();
  await map.mapComponentIsVisible();
});
