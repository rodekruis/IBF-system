import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class LoginPage extends DashboardPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly codeInput: Locator;
  readonly loginButton: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.emailInput = this.page.locator('input[type="email"]');
    this.codeInput = this.page.locator('input[type="text"]');
    this.loginButton = this.page.getByTestId('button-login');
    this.welcomeMessage = this.page.getByTestId('welcome-message');
  }

  async login(email?: string) {
    if (!email) {
      throw new Error('Email is required to login');
    }

    const loginRequest = this.page.waitForResponse('**/api/login');

    await this.emailInput.fill(email);
    await this.loginButton.click();

    const loginResponse = await loginRequest;
    const { code } = await loginResponse.json();

    await this.codeInput.fill(String(code));
  }

  async loginScreenIsVisible() {
    await this.page.waitForSelector('[data-testid="input-email"]');

    await expect(this.loginButton).toBeVisible();
    await expect(this.welcomeMessage).toHaveText('Welcome to IBF');
  }
}

export default LoginPage;
