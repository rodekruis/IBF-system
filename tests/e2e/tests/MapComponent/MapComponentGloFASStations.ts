import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(28, 'glofas_stations should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=28',
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
      await map.isLegendOpen({ legendOpen: true });
      await map.isLayerMenuOpen({ layerMenuOpen: false });
      await map.clickLayerMenu();
      await map.verifyLayerCheckboxCheckedByName({
        layerName: 'Glofas stations',
      });
      await map.assertLegendElementIsVisible({
        legendComponentName: 'GloFAS No action',
      });

      // GloFAS layer should be visible by default
      await map.gloFASMarkersAreVisible();

      // Reload the page to prepare for next test
      await dashboard.page.goto('/');
      await dashboard.page.waitForTimeout(1000);
    },
  );
};
