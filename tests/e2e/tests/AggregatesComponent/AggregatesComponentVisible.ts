import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

import { Components, Pages } from '../../helpers/interfaces';

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test(
    qase(6, 'Aggregates component elements should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=6',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { aggregates } = components;

      if (!dashboard || !aggregates) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToFloodDisasterType();
      // Assertions
      await aggregates.aggregateComponentIsVisible();
      await aggregates.aggregatesAlementsDisplayedInNoTrigger();
    },
  );
};
