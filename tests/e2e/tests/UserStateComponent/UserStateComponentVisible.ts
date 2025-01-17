import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test(
    qase(3, 'User state component elements should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=3',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { userState } = components;

      if (!dashboard || !userState) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToFloodDisasterType();
      // Assertions
      await userState.headerComponentIsVisible({
        countryName: NoTriggerDataSet.CountryName,
      });
      await userState.allUserStateElementsAreVisible({
        firstName: NoTriggerDataSet.firstName,
        lastName: NoTriggerDataSet.lastName,
      });
    },
  );
};
