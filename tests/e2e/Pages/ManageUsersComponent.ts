import { Locator, Page } from 'playwright';
import { expect } from 'playwright/test';

class ManageUsersComponent {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly menuButton: Locator;
  readonly tableHeaders: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = this.page
      .getByTestId('manage-users-search-input')
      .locator('input');
    this.menuButton = this.page
      .getByTestId('manage-users-menu-button')
      .locator('button');
    this.tableHeaders = this.page.getByTestId('manage-users-table-headers');
  }

  async isVisible() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.menuButton).toBeVisible();
    await expect(this.tableHeaders).toBeVisible();
  }
}

export default ManageUsersComponent;
