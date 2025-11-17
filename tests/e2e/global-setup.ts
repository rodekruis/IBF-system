import { registerUser, reset } from 'helpers/utility.helper';
import LoginPage from 'Pages/LoginPage';
import { chromium, FullConfig } from 'playwright/test';
import { datasets } from 'testData/datasets';

async function globalSetup(config: FullConfig) {
  await reset();

  for (const dataset of datasets) {
    const {
      country: { code },
      disasterType,
      user: { email },
      configurationId,
    } = dataset;
    const { baseURL } = config.projects[0].use;

    // create user with appropriate access
    await registerUser(dataset.user, code, disasterType.name);

    // launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(baseURL!);

    // login
    const loginPage = new LoginPage(page);
    await loginPage.login(email);
    await page.waitForSelector('[data-testid=loader]', { state: 'hidden' });

    // save auth state
    await page
      .context()
      .storageState({ path: '.auth/state-' + configurationId + '.json' });

    // close browser
    await browser.close();
  }
}

export default globalSetup;
