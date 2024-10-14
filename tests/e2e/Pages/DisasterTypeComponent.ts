import { expect } from '@playwright/test';
import { format } from 'date-fns';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class DisasterTypeComponent extends DashboardPage {
  readonly page: Page;
  readonly topBar: Locator;
  readonly timeline: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.topBar = this.page.getByTestId('dashboard-top-bar');
    this.timeline = this.page.getByTestId('timeline-button');
  }

  async topBarComponentIsVisible() {
    const topBar = this.topBar;
    await expect(topBar).toBeVisible();
  }

  async allDisasterTypeElementsArePresent() {
    const date = new Date();
    const formattedDate = format(date, 'd MMM yyyyEEEE,');
    const formattedTime = format(date, 'HH:mm');
    const currentDateTime = `${formattedDate} ${formattedTime}`;

    await expect(this.floodIcon).toBeVisible();
    await expect(this.heavyRainIcon).toBeVisible();
    await expect(this.droughtIcon).toBeVisible();
    await expect(this.topBar).toContainText(currentDateTime);
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
}

export default DisasterTypeComponent;
