import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[33053] Chat component elements should be visible', async () => {
    const { dashboard } = pages;
    const { chat, userState } = components;

    if (!dashboard || !chat || !userState) {
      throw new Error('pages and components not found');
    }
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();
    if (dataset.scenario === 'no-trigger') {
      await chat.chatColumnIsVisibleForNoTriggerState({
        user: dataset.user,
        date,
        disasterType: dataset.disasterType.name,
      });
    }
    await chat.allDefaultButtonsArePresent();
  });
};
