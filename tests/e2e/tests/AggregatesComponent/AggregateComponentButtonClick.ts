import test from '@playwright/test';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33060] Info button(s) should be clickable', async () => {
    const { dashboard } = pages;
    const { aggregates } = components;

    if (!dashboard || !aggregates) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await aggregates.validatesAggregatesInfoButtons();
    await aggregates.validateLayerPopoverExternalLink();

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
