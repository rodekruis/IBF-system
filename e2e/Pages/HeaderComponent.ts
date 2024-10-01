import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class UserState extends DashboardPage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.header = this.page.getByTestId('heading-display-name-span');
  }

  async userStateComponentIsVisible({ countryName }: { countryName: string }) {
    const header = this.header.filter({
      hasText: `IBF PORTAL ${countryName}`,
    });
    await expect(header).toBeVisible();
  }
}

export default UserState;
