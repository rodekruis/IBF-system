import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33062] Header colour should be purple', async () => {
    const { dashboard } = pages;
    const { aggregates, userState } = components;

    if (!dashboard || !aggregates || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);

    // Validate that the aggregates header is purple by class
    await aggregates.validateColorOfAggregatesHeaderByClass({
      isTrigger: true,
    });
  });
};
