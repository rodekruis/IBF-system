import test from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33062] should be purple header', async ({ page }) => {
    const aggregates = new AggregatesComponent(page);

    await aggregates.validateColorOfAggregatesHeaderByClass({
      isTrigger: dataset.scenario !== 'no-trigger',
    });
  });
};
