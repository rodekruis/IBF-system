import test from '@playwright/test';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33059] Title should change based on hovered map district', async () => {
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
  });
};
