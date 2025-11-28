import { Locator, Page } from 'playwright';
import { expect } from 'playwright/test';

class ManageAccountComponent {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly userRoleInput: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly whatsappInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = this.page
      .getByTestId('manage-account-email')
      .locator('input');
    this.userRoleInput = this.page
      .getByTestId('manage-account-role')
      .locator('input');
    this.firstNameInput = this.page
      .getByTestId('manage-account-first-name')
      .locator('input');
    this.middleNameInput = this.page
      .getByTestId('manage-account-middle-name')
      .locator('input');
    this.lastNameInput = this.page
      .getByTestId('manage-account-last-name')
      .locator('input');
    this.whatsappInput = this.page
      .getByTestId('manage-account-whatsapp')
      .locator('input');
    this.saveButton = this.page
      .getByTestId('manage-account-save')
      .locator('button');
  }

  async isVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeDisabled();

    await expect(this.userRoleInput).toBeVisible();
    await expect(this.userRoleInput).toBeDisabled();

    await expect(this.firstNameInput).toBeVisible();
    await expect(this.firstNameInput).toBeEnabled();

    await expect(this.middleNameInput).toBeVisible();
    await expect(this.middleNameInput).toBeEnabled();

    await expect(this.lastNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeEnabled();

    await expect(this.whatsappInput).toBeVisible();
    await expect(this.whatsappInput).toBeEnabled();

    await expect(this.saveButton).toBeVisible();
    await expect(this.saveButton).toBeDisabled();
  }

  async save() {
    const firstNameValue = await this.firstNameInput.inputValue();
    const newFirstNameValue = firstNameValue + 'x';
    await this.firstNameInput.fill(newFirstNameValue);

    const lastNameValue = await this.lastNameInput.inputValue();
    const newLastNameValue = lastNameValue + 'x';
    await this.lastNameInput.fill(newLastNameValue);

    const newWhatsappNumber = '+31647428590';
    await this.whatsappInput.fill(newWhatsappNumber);

    await expect(this.saveButton).toBeEnabled();

    await this.saveButton.click();
    await this.page.waitForSelector('[data-testid=loader]', {
      state: 'hidden',
    });

    await expect(this.firstNameInput).toHaveValue(newFirstNameValue);
    await expect(this.lastNameInput).toHaveValue(newLastNameValue);
    await expect(this.whatsappInput).toHaveValue(newWhatsappNumber);
    await expect(this.saveButton).toBeDisabled();
  }
}

export default ManageAccountComponent;
