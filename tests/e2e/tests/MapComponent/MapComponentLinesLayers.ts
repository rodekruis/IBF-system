import test from '@playwright/test';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[36134] should render lines layers', async ({ page }) => {
    const map = new MapComponent(page);

    const NON_COUNTRY_SPECIFIC_WMS_LAYERS = ['buildings', 'roads'];
    const linesLayers = dataset.layers.filter(({ name }) =>
      NON_COUNTRY_SPECIFIC_WMS_LAYERS.includes(name),
    );
    for (const linesLayer of linesLayers) {
      // toggle the layer ON
      await map.checkLayerCheckbox(linesLayer);

      // assert
      await map.assertWmsLayer(linesLayer);

      // collapse layer menu again
      await map.clickLayerMenu();
    }
  });
};
