import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33016] alert_threshold should be visible', async () => {
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
    await map.assertLegendElementIsVisible({
      legendComponentName: 'Alert Threshold Reached',
    });
    await map.assertAlertThresholdLines({ visible: false });

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
