import { Locator, Page } from 'playwright';
import { expect } from 'playwright/test';

class ManagePreferencesComponent {
  readonly page: Page;
  readonly headerLabel: Locator;
  readonly disasterTypes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerLabel = this.page.getByTestId('manage-preferences-header');
    this.disasterTypes = this.page.getByTestId(
      'manage-preferences-disaster-type',
    );
  }

  async isVisible() {
    await expect(this.headerLabel).toBeVisible();
    await expect(this.disasterTypes.first()).toBeVisible();

    const disasterTypeCount = await this.disasterTypes.count();
    expect(disasterTypeCount).toBeGreaterThan(0);
  }
}

export default ManagePreferencesComponent;
