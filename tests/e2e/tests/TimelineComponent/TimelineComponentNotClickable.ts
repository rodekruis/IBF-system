import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test(`[33066] Timeline elements are displaying alert level correctly`, async () => {
    const { dashboard } = pages;
    const { userState, timeline } = components;

    if (!dashboard || !userState || !timeline) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();

    // Assertions
    await timeline.validateTimelineDates(dataset.timeline);
    await timeline.assertPurpleTimelineButtonElements();
  });
};
