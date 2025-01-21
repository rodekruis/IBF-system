import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

// Test is skipped because it was flaky and more invastigation is needed to fix it
// Logged in PBI: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/32127/

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test(
    qase(10, 'Disaster types should be selectable'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=10',
      },
    },
    async () => {
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

      await dashboard.navigateToDisasterType('drought');
      await userState.headerComponentDisplaysCorrectDisasterType({
        countryName: NoTriggerDataSet.CountryName,
        disasterName: 'drought',
      });

      await dashboard.navigateToDisasterType('heavy-rain');
      await userState.headerComponentDisplaysCorrectDisasterType({
        countryName: NoTriggerDataSet.CountryName,
        disasterName: 'heavy-rain',
      });
    },
  );
};
