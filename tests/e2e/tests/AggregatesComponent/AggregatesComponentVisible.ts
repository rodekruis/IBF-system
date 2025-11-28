import test from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33058] should be visible', async ({ page }) => {
    const aggregates = new AggregatesComponent(page);

    await aggregates.aggregateComponentIsVisible();

    if (dataset.scenario === 'no-trigger') {
      await aggregates.aggregatesElementsDisplayedInNoTrigger(
        dataset.disasterType,
        dataset.layers,
      );
    }
  });
};
