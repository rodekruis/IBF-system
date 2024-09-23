import { test } from '@playwright/test';

import {
  getAccessToken,
  resetDB,
} from '../../../services/API-service/test/helpers/utility.helper';
import LoginPage from '../../Pages/LoginPage';

let accessToken: string;

test.beforeEach(async () => {
  accessToken = await getAccessToken();
  await resetDB(accessToken);
});

test('Successfully Login', async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login(
    process.env.USERCONFIG_MALAWI_EMAIL,
    process.env.USERCONFIG_MALAWI_PASSWORD,
  );
});

  await page.waitForURL((url) => url.pathname === '/');
});
