import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

// REFACTOR: break down the test into separate tests
// for legend, layer menu, and red cross branches

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test(`[33014] Map component should be interactive - Config: ${dataset.configurationId}`, async () => {
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
    await map.checkLayerCheckbox(dataset.mapLayers[0]); // REFACTOR
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Red Cross branches layer should be visible
    await map.redCrossMarkersAreVisible();
  });
};
