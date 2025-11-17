import test from '@playwright/test';
import TimelineComponent from 'Pages/TimelineComponent';

export default () => {
  test('[33064] should be visible', async ({ page }) => {
    const timeline = new TimelineComponent(page);

    await timeline.timlineElementsAreVisible();
  });
};
