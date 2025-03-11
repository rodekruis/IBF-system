import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  // REFACTOR: this test keeps being flaky, it should be refactored to be more stable
  test.skip('[33059] Title should change based on hovered map district', async () => {
    const { dashboard } = pages;
    const { aggregates, map } = components;

    if (!dashboard || !aggregates || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    await dashboard.waitForLoaderToDisappear();
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await map.clickLegendHeader();
    await map.assertAggregateTitleOnHoverOverMap();
  });
};
