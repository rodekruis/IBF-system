import test from '@playwright/test';
import TimelineComponent from 'Pages/TimelineComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test(`[33066] should indicate alert level`, async ({ page }) => {
    const timeline = new TimelineComponent(page);

    await timeline.validateTimelineDates(dataset.timeline);
    await timeline.assertPurpleTimelineButtonElements();
  });
};
