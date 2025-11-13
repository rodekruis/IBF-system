import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33018] map should show active layers', async () => {
    const { dashboard } = pages;
    const { userState, map } = components;

    if (!dashboard || !userState || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();
    await map.mapComponentIsVisible();

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });
    await map.isLegendOpen({ legendOpen: true });

    // Check if the active map layers are visible
    const activeLayers = dataset.layers.filter(({ active }) => active);

    for (const layer of activeLayers) {
      await map.assertLegendElementIsVisible({
        legendLabels: layer.legendLabels,
      });

      // we do not expect to see layers with map: false
      if (!layer.map) return;

      await map.isLayerVisible(layer, dataset.scenario);

      if (layer.type === 'wms') {
        await map.isLayerCheckboxChecked({ layerName: layer.name });
        await map.validateLayerIsVisibleInMapBySrcElement({
          layerName: layer.name,
        });
      } else if (layer.type === 'admin-area') {
        await map.isLayerRadioButtonChecked({ layerName: layer.name });
        // Validate that the layer checked with radio button is visible on the map in this case 'Exposed population' only one such layer can be checked at a time
        await map.areAdminBoundariesVisible({ layerName: layer.name });
      }
    }
  });
};
