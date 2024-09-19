import { test } from '@playwright/test';
import LoginPage from '../../Pages/LoginPage';
// import {
//   getAccessToken,
//   resetDB,
// } from '../../../services/API-service/test/helpers/utility.helper';

// let accessToken: string;

test.beforeEach(async ({ page }) => {
  // accessToken = await getAccessToken();
  // console.log('accessToken: ', accessToken);
  // await resetDB(accessToken);

  // Login
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login(
    process.env.USERCONFIG_MALAWI_EMAIL,
    process.env.USERCONFIG_MALAWI_PASSWORD,
  );
});

test('Successfully Login', async ({ page }) => {
  await page.waitForURL((url) => url.pathname.startsWith('/'));
});
