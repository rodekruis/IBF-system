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

  async allDisasterTypeElementsArePresent(disasterTypes: string[]) {
    const date = new Date();
    const formattedDate = format(date, 'd MMM yyyyEEEE,');
    // const formattedTime = format(date, 'HH:mm ');
    const currentDateTime = `${formattedDate}`; // ${formattedTime}`; // Including the time makes the test flaky, omit for now

    for (const disasterType of disasterTypes) {
      const disasterTypeIcon = this.page.getByTestId(
        `disaster-type-button-${disasterType}`,
      );
      await expect(disasterTypeIcon).toBeVisible();
    }
    await expect(this.topBar).toContainText(currentDateTime);
  }
}

export default DisasterTypeComponent;
