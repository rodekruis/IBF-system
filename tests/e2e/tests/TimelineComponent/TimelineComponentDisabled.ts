import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test.only(
    qase(14, 'Timeline should be disabled'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=14',
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
      await timeline.timelineIsInactive(); // TODO: make conditional on disaster-type

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
