import { expect } from '@playwright/test';
import { addDays, format } from 'date-fns';
import { Locator, Page } from 'playwright';

import { DISASTER_TYPES_WITH_INACTIVE_TIMELINE } from '../testData/testData.enum';
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
    await this.page.waitForLoadState('networkidle');
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

  async validateTimelineBasedOnDisasterName({
    disasterName,
  }: {
    disasterName: string;
  }) {
    if (DISASTER_TYPES_WITH_INACTIVE_TIMELINE.includes(disasterName)) {
      await this.timelineIsInactive();
    } else {
      await this.timelineIsActive();
    }
  }

  async timelineIsInactive() {
    await this.waitForTimelineToBeLoaded();

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const button = timelinePeriods.nth(i);
      await expect(button).toHaveAttribute('disabled', '');
    }
  }

  // NOTE: This method is not used in the current tests because the disaster types with active timeline are not yet in scope
  // But it is kept here for future reference. It was tested briefly with drought and it worked.
  async timelineIsActive() {
    await this.waitForTimelineToBeLoaded();
    await this.page.waitForTimeout(1000);

    const timelinePeriods = this.page.locator(
      '[data-testid="timeline-button"][color="ibf-trigger-alert-secondary"]',
    );

    const count = await timelinePeriods.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = timelinePeriods.nth(i);
      const childElement = button.locator('[role="img"]');
      await expect(childElement).toBeVisible();
      await expect(button).not.toHaveAttribute('disabled', '');
    }
  }

  async validateTimelineDates() {
    await this.waitForTimelineToBeLoaded();

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);

    const today = new Date();
    for (let i = 0; i < count; i++) {
      const expectedDate = format(addDays(today, i), 'EEE dd MMM yyyy');
      const button = timelinePeriods.nth(i);
      const buttonText = (await button.innerText()).replace(/\s+/g, ' ').trim();
      expect(buttonText).toBe(expectedDate);
    }
  }

  async assertPurpleTimelineButtonElements() {
    await this.waitForTimelineToBeLoaded();
    await this.page.waitForTimeout(1000);

    const timelinePeriods = this.page.locator(
      '[data-testid="timeline-button"][color="ibf-trigger-alert-secondary"]',
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
