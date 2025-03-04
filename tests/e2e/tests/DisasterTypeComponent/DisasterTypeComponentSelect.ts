import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33029] Disaster types should be selectable', async () => {
    const { dashboard } = pages;
    const { userState } = components;

    if (!dashboard || !userState) {
      throw new Error('pages and components not found');
    }

    for (const hazardIndex in dataset.hazards) {
      // Navigate between disaster types no matter the mock data
      const hazard = dataset.hazards[hazardIndex];
      await dashboard.navigateToDisasterType(hazard);
      await userState.headerComponentDisplaysCorrectDisasterType({
        country: dataset.country,
        hazard,
        title: dataset.title,
      });
    }
  });
};
