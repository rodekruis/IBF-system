import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
  date: Date,
) => {
  test('[33028] Disaster type component elements should be visible', async () => {
    const { dashboard } = pages;
    const { userState, disasterType: disasterTypeComponent } = components;

    if (!dashboard || !userState || !disasterTypeComponent) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await disasterTypeComponent.topBarComponentIsVisible();
    await disasterTypeComponent.allDisasterTypeElementsArePresent(date);

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
