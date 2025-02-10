import { expect } from '@playwright/test';
import { addDays, format } from 'date-fns';
import { Locator, Page } from 'playwright';

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

  async validateTimelineDates() {
    await this.waitForTimelineToBeLoaded();

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    // This is optional but the question is if there is always prediction for 7 days if not then we should remove it to keep it high level
    expect(count).toBe(8);

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
      '[data-testid="timeline-button"][ng-reflect-color="ibf-trigger-alert-secondary"]',
    );
    // Debug logging
    console.log('Waiting for timeline buttons to be visible...');
    await this.page.waitForSelector('[data-testid="timeline-button"]', {
      timeout: 5000,
    });
    console.log('Timeline buttons should be loaded.');

    const count = await timelinePeriods.count();
    console.log(`Found ${count} timeline buttons.`);

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = timelinePeriods.nth(i);
      const childElement = button.locator(
        '[ng-reflect-src="/assets/icons/Alert_Title_Purp"]',
      );
      await expect(childElement).toBeVisible();
    }
  }
}

export default TimelineComponent;
