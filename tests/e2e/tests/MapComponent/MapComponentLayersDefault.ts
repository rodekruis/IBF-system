import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33022] flood_extent and exposed_population should be active by default', async () => {
    const { dashboard } = pages;
    const { userState, map } = components;

    if (!dashboard || !userState || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.hazard);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    // Wait for the sharedPage to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();

    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });
    await map.isLayerCheckboxChecked({
      layerName: 'flood_extent', // REFACTOR
    });
    await map.isLayerRadioButtonChecked({
      layerName: 'population_affected', // REFACTOR
    });
    // Validate legend
    await map.isLegendOpen({ legendOpen: true });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Flood extent', // REFACTOR
    });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Exposed population', // REFACTOR
    });
    // Validate that the layer checked with radio button is visible on the map in this case 'Exposed population' only one such layer can be checked at a time
    await map.areAdminBoundariesVisible({ layerName: 'population_affected' }); // REFACTOR
    // Validate rest of the map
    await map.validateLayerIsVisibleInMapBySrcElement(dataset.indicators[0]);
  });
};
