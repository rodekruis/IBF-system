import test from '@playwright/test';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

// REFACTOR: break down the test into separate tests
// for legend, layer menu, and red cross branches

export default (dataset: Dataset) => {
  test('[33014] should be interactive', async ({ page }) => {
    const map = new MapComponent(page);

    // Close the legend
    await map.isLegendOpen({ legendOpen: true });
    await map.clickLegendHeader();
    await map.isLegendOpen({ legendOpen: false });

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Select and deselect the layer
    await map.clickLayerMenu();
    await map.checkLayerCheckbox(dataset.layers.find(({ map }) => map)!);
    await map.isLayerMenuOpen({ layerMenuOpen: true });
  });
};
