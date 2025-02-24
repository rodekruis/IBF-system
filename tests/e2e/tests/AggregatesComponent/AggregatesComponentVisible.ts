import test from '@playwright/test';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  testData: any,
) => {
  test('[33058] Aggregates component elements should be visible', async () => {
    const { dashboard } = pages;
    const { aggregates } = components;

    if (!dashboard || !aggregates) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(testData.disasterType);
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await aggregates.aggregatesAlementsDisplayedInNoTrigger(testData);

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
