import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';
import { DisasterTypeEnum } from '../ScenarioNoTrigger.spec';

// REFACTOR: break down the test into separate tests
// for legend, layer menu, and red cross branches

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: DisasterTypeEnum,
) => {
  test(
    qase(7, `Map component should be interactive - ${disasterType}`),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=7',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { userState, map } = components;

    if (!dashboard || !userState || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
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
    await map.clickLayerCheckbox({ layerName: 'Red Cross branches' });
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Red Cross branches layer should be visible
    await map.redCrossMarkersAreVisible();

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
