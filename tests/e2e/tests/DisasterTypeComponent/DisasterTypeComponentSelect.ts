import test from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33029] should be clickable', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    for (const disasterTypeIndex in dataset.country.disasterTypes) {
      // Navigate between disaster types no matter the mock data
      const disasterType = dataset.country.disasterTypes[disasterTypeIndex];
      await dashboard.navigateToDisasterType(disasterType);
      await dashboard.waitForLoader();
    }
  });
};
