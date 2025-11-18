import {
  getStorageState,
  getUserEmail,
  registerUser,
  reset,
} from 'helpers/utility.helper';
import LoginPage from 'Pages/LoginPage';
import { chromium, FullConfig } from 'playwright/test';
import { datasets } from 'testData/datasets';
import { UserRole } from 'testData/enums';

async function globalSetup(config: FullConfig) {
  await reset();

  for (const dataset of datasets) {
    const {
      country: { code },
      disasterType,
      user,
      configurationId,
    } = dataset;
    const { baseURL } = config.projects[0].use;
    const userRoles = Object.values(UserRole);

    for (const userRoleIndex in userRoles) {
      const userRole = userRoles[userRoleIndex];
      const email = getUserEmail(dataset, userRole);

      // create users with appropriate access and roles
      await registerUser(user, email, code, disasterType.name, userRole);

      // launch browser
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(baseURL!);

      // login
      const loginPage = new LoginPage(page);
      await loginPage.login(email);
      await page.waitForSelector('[data-testid=loader]', { state: 'hidden' });

      // save auth state
      const context = page.context();
      await context.storageState({
        path: getStorageState(configurationId, userRole),
      });

      // close browser
      await browser.close();
    }
  }
}

export default globalSetup;
