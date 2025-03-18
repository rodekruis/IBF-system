import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test(`[33028] Disaster type component elements should be visible - Config: ${dataset.configurationId}`, async () => {
    const { dashboard } = pages;
    const { userState, disasterType: disasterTypeComponent } = components;

    if (!dashboard || !userState || !disasterTypeComponent) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();
    await disasterTypeComponent.topBarComponentIsVisible();
    await disasterTypeComponent.allDisasterTypeElementsArePresent();
  });
};
