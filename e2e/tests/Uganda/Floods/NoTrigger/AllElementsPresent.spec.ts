import { test } from '@playwright/test';

import users from '../../../../../services/API-service/src/scripts/json/users.json';
import {
  getAccessToken,
  resetDB,
} from '../../../../../services/API-service/test/helpers/utility.helper';
import LoginPage from '../../../../Pages/LoginPage';

let accessToken: string;
const admin = users.find((user) => user.userRole === 'admin');

test.beforeEach(async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);

  accessToken = await getAccessToken();
  await resetDB(accessToken);

  await page.goto('/');
  await loginPage.login(admin?.email, admin?.password);
});

test('All elements are present', async ({ page }) => {
  await page.waitForURL((url) => url.pathname === '/');
});
