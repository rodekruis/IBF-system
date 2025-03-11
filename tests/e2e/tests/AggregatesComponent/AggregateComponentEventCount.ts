import test, { expect } from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33061] Number of events should be non-zero', async () => {
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

    // get the number of warning events and aggregated events
    const eventCount = await aggregates.getEventCount();

    // check if the number of warning events is equal to the number of aggregated events
    expect(eventCount).toBeGreaterThan(0);
  });
};
