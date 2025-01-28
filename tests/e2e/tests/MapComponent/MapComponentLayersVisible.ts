import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33018] Map should show active layers', async () => {
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

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Check if the default layers are visible
    const activeLayers = await map.returnLayerCheckedCheckboxes();
    if (activeLayers) {
      await map.validateLayersAreVisibleByName({ layerNames: activeLayers });
    } else {
      throw new Error('No layers are visible');
    }

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
