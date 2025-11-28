import test from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33029] should be clickable', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // navigate disaster types
    for (const disasterTypeIndex in dataset.country.disasterTypes) {
      const disasterType = dataset.country.disasterTypes[disasterTypeIndex];
      await dashboard.navigateToDisasterType(disasterType);
      await page.waitForSelector('[data-testid=loader]', { state: 'hidden' });
    }
  });
};
