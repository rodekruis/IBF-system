import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test(`[33029] Disaster types should be selectable - Config: ${dataset.configurationId}`, async () => {
    const { dashboard } = pages;
    const { userState } = components;

    if (!dashboard || !userState) {
      throw new Error('pages and components not found');
    }

    for (const disasterTypeIndex in dataset.country.disasterTypes) {
      // Navigate between disaster types no matter the mock data
      const disasterType = dataset.country.disasterTypes[disasterTypeIndex];
      await dashboard.navigateToDisasterType(disasterType);
      await dashboard.waitForLoaderToDisappear();
      await userState.headerComponentDisplaysCorrectDisasterType({
        country: dataset.country,
        disasterType,
        title: dataset.title,
      });
    }
  });
};
