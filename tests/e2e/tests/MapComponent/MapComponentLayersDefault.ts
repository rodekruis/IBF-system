import test from '@playwright/test';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33022] flood_extent and exposed_population should be active by default', async () => {
    const { dashboard } = pages;
    const { userState, map } = components;

    if (!dashboard || !userState || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    // Wait for the sharedPage to load
    await dashboard.waitForLoaderToDisappear();

    await map.mapComponentIsVisible();

    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });
    await map.verifyLayerCheckboxCheckedByName({
      layerName: 'Flood extent',
    });
    await map.verifyLayerRadioButtonCheckedByName({
      layerName: 'Exposed population',
    });
    // Validate legend
    await map.isLegendOpen({ legendOpen: true });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Flood extent',
    });
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Exposed population',
    });
    // Validate that the layer checked with radio button is visible on the map in this case 'Exposed population' only one such layer can be checked at a time
    await map.validateAggregatePaneIsNotEmpty();
    // Validate rest of the map
    await map.validateLayerIsVisibleInMapBySrcElement({
      layerName: 'flood_extent',
    });

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
