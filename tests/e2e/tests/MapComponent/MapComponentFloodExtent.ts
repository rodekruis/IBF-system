import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(35, 'flood_extent legend should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=35',
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
        countryName: TriggerDataSet.CountryName,
      });
      // Wait for the sharedPage to load
      await dashboard.waitForLoaderToDisappear();

      await map.mapComponentIsVisible();
      await map.isLegendOpen({ legendOpen: true });
      await map.assertLegendElementIsVisible({
        legendComponentName: 'Flood extent',
      });
    },
  );
};
