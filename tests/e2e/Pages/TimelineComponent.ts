import { expect } from '@playwright/test';
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

  /**
   * Creates a regex pattern for a given date format
   */
  createRegexFromDateFormat(dateFormat: string): RegExp {
    const formatParts = dateFormat.split(' ');
    const regexParts = formatParts.map((part) => {
      if (part === 'EEE') return '[A-Za-z]{3}'; // Day of week abbreviated
      if (part === 'dd') return '\\d{1,2}'; // Day of month
      if (part === 'MMM') return '[A-Za-z]{3}'; // Month abbreviated
      if (part === 'HH:00') return '\\d{1,2}:00'; // Hours rounded to 0
      if (part === 'yyyy') return '\\d{4}'; // Year
      return part;
    });
    return new RegExp(regexParts.join(' '));
  }

  async validateTimelineDates(timeline: Timeline) {
    await this.waitForTimelineToBeLoaded();

    const timelinePeriods = this.timeline;
    const count = await timelinePeriods.count();

    expect(count).toBeGreaterThan(0);

    const alertPattern = this.createRegexFromDateFormat(
      timeline.dateFormatAlert ?? timeline.dateFormat,
    );
    const noAlertPattern = this.createRegexFromDateFormat(timeline.dateFormat);

    for (let i = 0; i < count; i++) {
      const button = timelinePeriods.nth(i);
      const hasAlert = (await button.getAttribute('class'))?.includes(
        'forecast-alert',
      );
      const buttonText = (await button.innerText()).replace(/\s+/g, ' ').trim();
      if (hasAlert) {
        expect(buttonText).toMatch(alertPattern);
      } else {
        expect(buttonText).toMatch(noAlertPattern);
      }
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
