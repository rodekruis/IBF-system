import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class DisasterTypeComponent extends DashboardPage {
  readonly page: Page;
  readonly topBar: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.topBar = this.page.getByTestId('dashboard-top-bar');
  }

  async topBarComponentIsVisible() {
    const topBar = this.topBar;
    await expect(topBar).toBeVisible();
  }
}

export default DisasterTypeComponent;
