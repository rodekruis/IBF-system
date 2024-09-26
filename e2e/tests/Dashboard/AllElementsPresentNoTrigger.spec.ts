import { test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import HeaderComponent from 'Pages/HeaderComponent';
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

  await dashboard.switchToCountryByName({
    countryName: NoTriggerDataSet.CountryName,
  });

  await dashboard.navigateToFloodDisasterType();

  await header.headerComponentIsVisible({
    countryName: NoTriggerDataSet.CountryName,
  });
});
