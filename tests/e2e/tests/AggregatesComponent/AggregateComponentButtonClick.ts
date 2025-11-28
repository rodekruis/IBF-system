import test from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33060] should allow info buttons click', async ({ page }) => {
    const aggregates = new AggregatesComponent(page);

    await aggregates.validatesAggregatesInfoButtons(
      dataset.layers,
      dataset.aggregates.disclaimer,
    );
  });
};
