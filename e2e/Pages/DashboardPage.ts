import { Locator, Page } from 'playwright';

class DashboardPage {
  readonly page: Page;
  readonly floodIcon: Locator;
  readonly heavyRainIcon: Locator;
  readonly droughtIcon: Locator;
  readonly dashboardDevControlButton: Locator;
  readonly countrySwitcherDropdown: Locator;
  readonly countrySwitcherDropdownOption: Locator;
  readonly dashboardDevControlCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.floodIcon = this.page.locator(
      '[data-testid="disaster-type-button"][ng-reflect-src*="Flood"]',
    );
    this.heavyRainIcon = this.page.locator(
      '[data-testid="disaster-type-button"][ng-reflect-src*="Rain"]',
    );
    this.droughtIcon = this.page.locator(
      '[data-testid="disaster-type-button"][ng-reflect-src*="Drought"]',
    );
    this.dashboardDevControlButton = this.page.getByTestId(
      'dashboard-dev-control-button',
    );
    this.countrySwitcherDropdown = this.page.getByTestId(
      'country-switcher-dropdown',
    );
    this.countrySwitcherDropdownOption = this.page.locator('ion-radio');
    this.dashboardDevControlCloseButton = this.page.getByTestId(
      'dashboard-dev-control-close-button',
    );
  }

  async navigateToFloodDisasterType() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');

    await this.floodIcon.click();
  }

  async navigateToHeavyRainDisasterType() {
    await this.heavyRainIcon.click();
  }

  async navigateToDroughtDisasterType() {
    await this.droughtIcon.click();
  }

  async switchToCountryByName({ countryName }: { countryName: string }) {
    await this.dashboardDevControlButton.click();
    await this.countrySwitcherDropdown.click();
    await this.countrySwitcherDropdownOption
      .filter({ hasText: countryName })
      .click();
    await this.dashboardDevControlCloseButton.click();
  }
}

export default DashboardPage;
