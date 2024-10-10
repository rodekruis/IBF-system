import { expect } from '@playwright/test';
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

  async timlineElementsAreVisible() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('[data-testid="timeline-button"]');

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(timelinePeriods.nth(i)).toBeVisible();
    }
  }

  async timelineIsInactive() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('[data-testid="timeline-button"]');

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const button = timelinePeriods.nth(i);
      await expect(button).toHaveAttribute('disabled', '');
    }
  }
}

export default TimelineComponent;
