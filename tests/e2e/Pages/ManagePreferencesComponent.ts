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

  async toggle() {
    // pick the first disaster type checkbox to toggle
    const checkbox = this.disasterTypes.first().getByRole('checkbox');

    // get the current state of the checkbox
    const checked = await checkbox.isChecked();
    await checkbox.click();

    // verify that the checkbox state has changed
    await expect(checkbox).toBeChecked({ checked });
  }
}

export default ManagePreferencesComponent;
