import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[36134] Map should render lines layers successfully', async () => {
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

    const linesLayers = dataset.layers.filter((l) => l.type === 'line');
    for (const linesLayer of linesLayers) {
      // Toggle the layer ON
      await map.checkLayerCheckbox(linesLayer);

      // Assert
      await map.assertWmsLayer(linesLayer);

      // collapse layer menu again
      await map.clickLayerMenu();
    }
  });
};
