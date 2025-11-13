import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[34458] Set trigger (from warning)', async () => {
    const { dashboard, login } = pages;
    const { chat, userState, aggregates, map } = components;

    if (!dashboard || !chat || !userState || !aggregates || !login || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();
    await chat.chatColumnIsVisible({ date, scenario: dataset.scenario });
    await chat.allDefaultButtonsArePresent();

    // Set trigger
    if (
      !(
        dataset.country.code === 'UGA' &&
        dataset.disasterType.name === 'drought' &&
        dataset.scenario === 'warning'
      )
      // HACK: workaround coz it auto-navigates to event view
    ) {
      await chat.clickShowPredictionButton(dataset.scenario);
    }
    await chat.setTrigger();
    await dashboard.waitForLoaderToDisappear(); // This is needed because the setTrigger comes with a page reload. Otherwise the next test will fail.

    // Assertions
    await map.assertTriggerOutlines('trigger');
  });
};
