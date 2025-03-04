import test from '@playwright/test';

import { Components, Pages } from '../../helpers/interfaces';
import { Dataset } from 'testData/types';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33060] Info button(s) should be clickable', async () => {
    const { dashboard } = pages;
    const { aggregates } = components;

    if (!dashboard || !aggregates) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.hazard);
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await aggregates.validatesAggregatesInfoButtons();
    await aggregates.validateLayerPopoverExternalLink();
  });
};
