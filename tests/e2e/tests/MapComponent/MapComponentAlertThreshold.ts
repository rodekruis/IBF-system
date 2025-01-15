import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (pages: Partial<Pages>, components: Partial<Components>) => {
  test(
    qase(29, 'alert_threshold should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=29',
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
      await map.isLegendOpen({ legendOpen: true });
      await map.assertLegendElementIsVisible({
        legendComponentName: 'Alert Threshold Reached',
      });
      await map.assertAlertThresholdLines({ visible: false });
    },
  );
};
