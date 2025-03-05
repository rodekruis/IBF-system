import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[33012] Dashboard page elements should be visible', async () => {
    const { dashboard } = pages;
    const { chat, userState, aggregates, map, disasterType } = components;

    if (
      !dashboard ||
      !chat ||
      !userState ||
      !aggregates ||
      !map ||
      !disasterType
    ) {
      throw new Error('pages and components not found');
    }
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await disasterType.topBarComponentIsVisible();
    if (dataset.scenario === 'trigger') {
      // REFACTOR
      await chat.chatColumnIsVisibleForTriggerState({
        user: dataset.user,
        date,
      });
    } else if (dataset.scenario === 'no-trigger') {
      // REFACTOR
      await chat.chatColumnIsVisibleForNoTriggerState({
        user: dataset.user,
        date,
        disasterType: dataset.disasterType,
      });
    }
    await aggregates.aggregateComponentIsVisible();
    await map.mapComponentIsVisible();
  });
};
