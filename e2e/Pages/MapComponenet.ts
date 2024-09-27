import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class MapComponenet extends DashboardPage {
  readonly page: Page;
  readonly mapComponent: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.mapComponent = this.page.getByTestId('dashboard-map-componenet');
  }

  async mapComponentIsVisible() {
    await expect(this.mapComponent).toBeVisible();
  }
}

export default MapComponenet;
