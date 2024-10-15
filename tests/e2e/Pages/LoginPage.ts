import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import EnglishTranslations from '../../../interfaces/IBF-dashboard/src/assets/i18n/en.json';
import DashboardPage from './DashboardPage';

const welcomeMessageEnglishTranslation =
  EnglishTranslations['login-page'].welcome;

class LoginPage extends DashboardPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.usernameInput = this.page.getByLabel('E-mail');
    this.passwordInput = this.page.locator('input[type="password"]');
    this.loginButton = this.page.getByRole('button', { name: 'Log in' });
    this.welcomeMessage = this.page.getByTestId('login-welcome-message');
  }

  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginScreenIsVisible() {
    // explicitly wait for the email input to avoid timing issues
    await this.page.waitForSelector('input[type="email"]');

    await expect(this.loginButton).toBeVisible();
    await expect(this.welcomeMessage).toHaveText(
      welcomeMessageEnglishTranslation,
    );
  }
}

export default LoginPage;
