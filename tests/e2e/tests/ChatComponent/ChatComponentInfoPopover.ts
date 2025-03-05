import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[33057] Info icon should open popover on click', async () => {
    const { dashboard } = pages;
    const { chat, userState } = components;

    if (!dashboard || !chat || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await chat.chatColumnIsVisibleForTriggerState({
      user: dataset.user,
      date,
    });
    await chat.validateEventsInfoButtonsAreClickable();
  });
};
