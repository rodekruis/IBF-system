import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33059] Title should change based on hovered map district', async () => {
    const { dashboard } = pages;
    const { aggregates, map } = components;

    if (!dashboard || !aggregates || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    await map.assertAggregateTitleOnHoverOverMap();
  });
};
