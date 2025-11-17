import test from '@playwright/test';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33018] should show active layers', async ({ page }) => {
    const map = new MapComponent(page);

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

      if (layer.type === 'admin-area') {
        await map.isLayerRadioButtonChecked({ layerName: layer.name });
        // Validate that the layer checked with radio button is visible on the map in this case 'Exposed population' only one such layer can be checked at a time
        await map.areAdminBoundariesVisible({ layerName: layer.name });
      } else {
        await map.isLayerCheckboxChecked({ layerName: layer.name });
        await map.validateLayerIsVisibleInMapBySrcElement({
          layerName: layer.name,
        });
      }
    }
  });
};
