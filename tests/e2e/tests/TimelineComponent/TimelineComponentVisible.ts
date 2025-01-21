import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(15, 'Timeline component elements should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=15',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { userState, timeline } = components;

      if (!dashboard || !userState || !timeline) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToDisasterType(disasterType);
      // Assertions
      await userState.headerComponentIsVisible({
        countryName: NoTriggerDataSet.CountryName,
      });
      await timeline.timlineElementsAreVisible();
    },
  );
};
