import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

class DashboardPage {
  readonly page: Page;
  readonly dashboardDevControlButton: Locator;
  readonly dashboardHomeButton: Locator;
  readonly countrySwitcherDropdown: Locator;
  readonly countrySwitcherDropdownOption: Locator;
  readonly dashboardDevControlCloseButton: Locator;
  readonly loader: Locator;
  readonly tooltipLabel: Locator;
  readonly tooltipContent: Locator;

  constructor(page: Page) {
    this.page = page;
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
    this.tooltipLabel = this.page.getByTestId('layer-info-title');
    this.tooltipContent = this.page.getByTestId('layer-info-content');
  }

  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async navigateToDisasterType(disasterType: string) {
    await this.page.waitForSelector(
      `[data-testid=disaster-type-button-${disasterType}]`,
    );
    const disasterTypeIcon = this.page.getByTestId(
      `disaster-type-button-${disasterType}`,
    );
    await disasterTypeIcon.click();
  }

  async waitForLoaderToDisappear() {
    await this.page.waitForSelector('[data-testid=loader]', {
      state: 'hidden',
    });
  }

  async validatePopOverText({ text }: { text: string }) {
    const popOverText = await this.page
      .locator('app-tooltip-popover')
      .nth(0)
      .textContent();
    const popOverTextTrimmed = popOverText?.trim();
    expect(popOverTextTrimmed).toContain(text);
  }

  async validateLabel({ text }: { text: string }) {
    const label = await this.tooltipLabel.textContent();
    expect(label).toContain(text);
  }

  async validateDescription({ text }: { text: string }) {
    const description = await this.tooltipContent.textContent();
    expect(description).toContain(text);
  }

  async waitForPageToBeLoadedAndStable() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

export default DashboardPage;
