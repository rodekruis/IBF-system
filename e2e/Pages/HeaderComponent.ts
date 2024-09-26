// import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class HeaderComponent extends DashboardPage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.header = this.page.getByTestId('heading-display-name-span');
  }

  async headerComponentIsVisible({ countryName }: { countryName: string }) {
    const header = this.header.filter({
      hasText: `IBF PORTAL ${countryName}`,
    });
    await header.isVisible();
  }
}

export default HeaderComponent;
