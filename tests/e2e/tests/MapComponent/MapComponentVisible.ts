import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';
import { DisasterTypeEnum } from '../ScenarioNoTrigger.spec';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(2, `Map component elements should be visible - ${disasterType}`),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=2',
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
      await map.mapComponentIsVisible();

      // PROTOTYPE EXAMPLE of disaster-type specific assertion
      if (disasterType === DisasterTypeEnum.Floods) {
        await map.breadCrumbViewIsVisible({ nationalView: true });
      }
      await map.isLegendOpen({ legendOpen: true });
      await map.isLayerMenuOpen({ layerMenuOpen: false });
      await map.assertAdminBoundariesVisible();

      // Reload the page to prepare for next test
      await dashboard.page.goto('/');
      await dashboard.page.waitForTimeout(1000);
    },
  );
};
