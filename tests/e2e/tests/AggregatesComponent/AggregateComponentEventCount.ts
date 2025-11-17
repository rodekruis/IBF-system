import test, { expect } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33061] should be non-zero event count', async ({ page }) => {
    const aggregates = new AggregatesComponent(page);

    const aggregatesEventCount = await aggregates.getEventCount();

    if (dataset.scenario === 'no-trigger') {
      expect(aggregatesEventCount).toBe(0);
    } else {
      expect(aggregatesEventCount).toBeGreaterThan(0);
    }
  });
};
