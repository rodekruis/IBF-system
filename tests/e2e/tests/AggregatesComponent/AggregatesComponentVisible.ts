import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33058] Aggregates component elements should be visible', async () => {
    const { dashboard } = pages;
    const { aggregates } = components;

    if (!dashboard || !aggregates) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await aggregates.aggregateComponentIsVisible();
    if (dataset.scenario === 'no-trigger') {
      await aggregates.aggregatesElementsDisplayedInNoTrigger(
        dataset.disasterType.label,
        dataset.aggregateIndicators,
      );
    }
  });
};
