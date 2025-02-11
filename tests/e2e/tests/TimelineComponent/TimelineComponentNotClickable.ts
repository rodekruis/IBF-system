import test from '@playwright/test';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33066] Timeline Buttons are not clickable', async () => {
    const { dashboard } = pages;
    const { userState, timeline } = components;

    if (!dashboard || !userState || !timeline) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await timeline.validateTimelineBasedOnHeader({
      disasterName: 'floods',
    });
    await timeline.validateTimelineDates();
    await timeline.assertPurpleTimelineButtonElements();

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
