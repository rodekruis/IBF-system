import test, { expect } from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33061] number of events should be non-zero', async () => {
    const { dashboard } = pages;
    const { aggregates, userState } = components;

    if (!dashboard || !aggregates || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();

    const aggregatesEventCount = await aggregates.getEventCount();

    if (dataset.scenario === 'no-trigger') {
      expect(aggregatesEventCount).toBe(0);
    } else {
      expect(aggregatesEventCount).toBeGreaterThan(0);
    }
  });
};
