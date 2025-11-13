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
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();
    await disasterType.topBarComponentIsVisible();
    await chat.chatColumnIsVisible({ date, scenario: dataset.scenario });
    await aggregates.aggregateComponentIsVisible();
    await map.mapComponentIsVisible();
  });
};
