import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test(`[33066] Timeline's purple buttons are active or inactive dependent on disaster type`, async () => {
    const { dashboard } = pages;
    const { userState, timeline } = components;

    if (!dashboard || !userState || !timeline) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await timeline.validateTimelineDates();
    await timeline.assertPurpleTimelineButtonElements();
  });
};
