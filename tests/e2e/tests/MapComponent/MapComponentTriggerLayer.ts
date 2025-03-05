import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33016] trigger outline layer should be visible', async () => {
    const { dashboard } = pages;
    const { userState, map } = components;

    if (!dashboard || !userState || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();
    await map.isLegendOpen({ legendOpen: true });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Area triggered', // REFACTOR
    });
    await map.assertTriggerOutlines({
      visible: dataset.scenario === 'trigger', // REFACTOR
    });
  });
};
