import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33019] Trigger GloFAS station(s) should not be visible', async () => {
    const { dashboard } = pages;
    const { userState, map } = components;

    if (!dashboard || !userState || !map) {
      throw new Error('pages and components not found');
    }

    if (dataset.disasterType.name !== 'floods') {
      return;
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();
    await map.isLegendOpen({ legendOpen: true });
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerCheckboxChecked({
      layerName: 'glofas_stations', // REFACTOR
    });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'GloFAS No action', // REFACTOR
    });

    // GloFAS layer should be visible by default
    await map.glofasMarkersAreVisible();

    // Assert that the max warning GloFAS markers are not visible
    await map.glofasMarkersAreVisible({
      eapAlertClass: 'max',
      isVisible: false,
    });
  });
};
