import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

class DashboardPage {
  readonly page: Page;
  readonly floodIcon: Locator;
  readonly heavyRainIcon: Locator;
  readonly droughtIcon: Locator;
  readonly dashboardDevControlButton: Locator;
  readonly dashboardHomeButton: Locator;
  readonly countrySwitcherDropdown: Locator;
  readonly countrySwitcherDropdownOption: Locator;
  readonly dashboardDevControlCloseButton: Locator;
  readonly loader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.floodIcon = this.page.getByTestId('disaster-type-button-floods');
    this.heavyRainIcon = this.page.getByTestId(
      'disaster-type-button-heavy-rain',
    );
    this.droughtIcon = this.page.getByTestId('disaster-type-button-drought');
    this.dashboardDevControlButton = this.page.getByTestId(
      'dashboard-dev-control-button',
    );
    this.dashboardHomeButton = this.page.getByTestId('dashboard-home-button');
    this.countrySwitcherDropdown = this.page.getByTestId(
      'country-switcher-dropdown',
    );
    this.countrySwitcherDropdownOption = this.page.locator('ion-radio');
    this.dashboardDevControlCloseButton = this.page.getByTestId(
      'dashboard-dev-control-close-button',
    );
    this.loader = this.page.getByTestId('loader');
  }

  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async navigateToFloodDisasterType() {
    await this.page.waitForSelector(
      '[data-testid=disaster-type-button-floods]',
    );
    await this.floodIcon.click();
  }

  async navigateToHeavyRainDisasterType() {
    await this.page.waitForSelector(
      '[data-testid=disaster-type-button-heavy-rain]',
    );
    await this.heavyRainIcon.click();
  }

  async navigateToDroughtDisasterType() {
    await this.page.waitForSelector(
      '[data-testid=disaster-type-button-drought]',
    );
    await this.droughtIcon.click();
  }

  async waitForLoaderToDisappear() {
    await this.page.waitForSelector('[data-testid=loader]', {
      state: 'hidden',
    });
  }

  async validatePopOverText({ text }: { text: string }) {
    const popOverText = await this.page
      .locator('app-tooltip-popover')
      .textContent();
    const popOverTextTrimmed = popOverText?.trim();
    expect(popOverTextTrimmed).toContain(text);
  }

  async waitForPageToBeLoadedAndStable() {
    await this.page.waitForLoadState('domcontentloaded');
    // await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }
}

export default DashboardPage;
