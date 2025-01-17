import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test(
    qase(4, 'Disaster type component elements should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=4',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { userState, disasterType } = components;

      if (!dashboard || !userState || !disasterType) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToFloodDisasterType();
      // Assertions
      await userState.headerComponentIsVisible({
        countryName: NoTriggerDataSet.CountryName,
      });
      await disasterType.topBarComponentIsVisible();
      await disasterType.allDisasterTypeElementsArePresent();
    },
  );
};
