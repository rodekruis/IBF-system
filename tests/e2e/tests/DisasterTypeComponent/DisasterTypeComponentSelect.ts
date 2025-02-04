import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

// Test is skipped because it was flaky and more invastigation is needed to fix it
// Logged in PBI: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/32127/

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test('[33029] Disaster types should be selectable', async () => {
    const { dashboard } = pages;
    const { userState } = components;

    if (!dashboard || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate between disaster types no matter the mock data
    await dashboard.navigateToDisasterType('floods');
    await userState.headerComponentDisplaysCorrectDisasterType({
      countryName: NoTriggerDataSet.CountryName,
      disasterName: 'floods',
    });

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');

    await dashboard.navigateToDisasterType('drought');
    await userState.headerComponentDisplaysCorrectDisasterType({
      countryName: NoTriggerDataSet.CountryName,
      disasterName: 'drought',
    });

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');

    await dashboard.navigateToDisasterType('heavy-rain');
    await userState.headerComponentDisplaysCorrectDisasterType({
      countryName: NoTriggerDataSet.CountryName,
      disasterName: 'heavy-rain',
    });

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
