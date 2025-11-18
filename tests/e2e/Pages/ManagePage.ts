import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

class ManagePage {
  readonly page: Page;
  readonly container: Locator;
  readonly tabBar: Locator;
  readonly tabButtonAccount: Locator;
  readonly tabButtonUsers: Locator;
  readonly tabButtonPreferences: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = this.page.getByTestId('manage-container');
    this.tabBar = this.page.getByTestId('manage-tab-bar');
    this.tabButtonAccount = this.page.getByTestId('manage-tab-button-account');
    this.tabButtonUsers = this.page.getByTestId('manage-tab-button-users');
    this.tabButtonPreferences = this.page.getByTestId(
      'manage-tab-button-preferences',
    );
  }

  async isVisible(isAdmin = false) {
    await expect(this.container).toBeVisible();
    await expect(this.tabBar).toBeVisible();
    await expect(this.tabButtonAccount).toBeVisible();
    if (isAdmin) {
      await expect(this.tabButtonUsers).toBeVisible();
    } else {
      await expect(this.tabButtonUsers).not.toBeVisible();
    }
    await expect(this.tabButtonPreferences).toBeVisible();
  }
}

export default ManagePage;
