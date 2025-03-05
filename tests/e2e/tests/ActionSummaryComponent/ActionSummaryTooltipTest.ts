import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33067] Info icon is clickable and opens popover in Actions summary', async () => {
    const { dashboard } = pages;
    const { userState, actionsSummary } = components;

    if (!userState || !actionsSummary || !dashboard) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    // Wait for the sharedPage to load
    await dashboard.waitForLoaderToDisappear();

    await actionsSummary.validateActionsSummaryInfoButtons();
  });
};
