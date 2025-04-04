import { expect } from '@playwright/test';
import { addDays, addMonths, format } from 'date-fns';
import { Locator, Page } from 'playwright';

import { Timeline } from '../testData/types';
import DashboardPage from './DashboardPage';

class TimelineComponent extends DashboardPage {
  readonly page: Page;
  readonly timeline: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.timeline = this.page.getByTestId('timeline-button');
  }

  async waitForTimelineToBeLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('[data-testid="timeline-button"]');
  }

  async timlineElementsAreVisible() {
    await this.waitForTimelineToBeLoaded();

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(timelinePeriods.nth(i)).toBeVisible();
    }
  }

  async validateTimelineDates(timeline: Timeline) {
    await this.waitForTimelineToBeLoaded();

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);

    const today = new Date();
    for (let i = 0; i < count; i++) {
      const expectedFormat = timeline.dateFormat;
      const expectedDate =
        timeline.dateUnit === 'days'
          ? format(addDays(today, i), expectedFormat)
          : timeline.dateUnit === 'months'
            ? format(addMonths(today, i), expectedFormat)
            : null;
      const button = timelinePeriods.nth(i);
      const buttonText = (await button.innerText()).replace(/\s+/g, ' ').trim();
      expect(buttonText).toBe(expectedDate);
    }
  }

  async assertPurpleTimelineButtonElements() {
    await this.waitForTimelineToBeLoaded();
    await this.page.waitForTimeout(1000);

    const timelinePeriods = this.page.locator(
      '[data-testid="timeline-button"][color="ibf-trigger-alert-tertiary"]',
    );

    const count = await timelinePeriods.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = timelinePeriods.nth(i);
      // Cheks if each purple button has a triangle icon element
      const triangleIcon = button.locator('[role="img"]');
      await expect(triangleIcon).toBeVisible();
    }
  }
}

export default TimelineComponent;
