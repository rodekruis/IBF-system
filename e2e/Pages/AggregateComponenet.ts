import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class AggregateComponenet extends DashboardPage {
  readonly page: Page;
  readonly aggregateSectionColumn: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.aggregateSectionColumn = this.page.getByTestId(
      'dashboard-aggregate-section',
    );
  }

  async aggregateComponentIsVisible() {
    await expect(this.aggregateSectionColumn).toBeVisible();
    await expect(this.aggregateSectionColumn).toContainText('National View');
  }
}

export default AggregateComponenet;
