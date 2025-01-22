import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(12, 'Title should change based on hovered map district'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=12',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { aggregates, map } = components;

      if (!dashboard || !aggregates || !map) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToDisasterType(disasterType);
      // Assertions
      await aggregates.aggregateComponentIsVisible();
      await map.clickLayerCheckbox({ layerName: 'Glofas stations' });
      await map.assertAggregateTitleOnHoverOverMap();

      // Reload the page to prepare for next test
      await dashboard.page.goto('/');
      await dashboard.page.waitForTimeout(1000);
    },
  );
};
