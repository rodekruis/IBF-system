import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test(
    qase(32, 'Map should show active layers'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=32',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { userState, map } = components;

      if (!dashboard || !userState || !map) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToFloodDisasterType();
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
    },
  );
};
