import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test(`[33066] Timeline's purple buttons are inactive and correctly styled`, async () => {
    const { dashboard } = pages;
    const { userState, timeline } = components;

    if (!dashboard || !userState || !timeline) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await timeline.validateTimelineIsInactive();
    await timeline.validateTimelineDates(dataset.timeline);
    // NOTE: this if can very seen be removed again, as the timeline will change to purple for both warning and trigger
    if (dataset.scenario === 'trigger') {
      await timeline.assertPurpleTimelineButtonElements();
    }
  });
};
