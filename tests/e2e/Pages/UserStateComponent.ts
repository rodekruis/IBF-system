import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class UserStateComponent extends DashboardPage {
  readonly page: Page;
  readonly header: Locator;
  readonly countryLogos: Locator;
  readonly userLoggedInLabel: Locator;
  readonly logOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.header = this.page.getByTestId('heading-display-name-span');
    this.countryLogos = this.page
      .getByTestId('user-state-country-logos')
      .nth(0);
    this.userLoggedInLabel = this.page
      .getByTestId('user-state-display-name-label')
      .nth(0);
    this.logOutButton = this.page.getByTestId('user-state-logout-button');
  }

  async headerComponentIsVisible({ countryName }: { countryName: string }) {
    const header = this.header.filter({
      hasText: `IBF PORTAL ${countryName}`,
    });
    await expect(header).toBeVisible();
  }

  async headerComponentDisplaysCorrectDisasterType({
    countryName,
    disasterName,
  }: {
    disasterName: string;
    countryName: string;
  }) {
    const header = this.header.filter({
      hasText: `IBF PORTAL ${countryName}`,
    });
    const headerText = await header.textContent().then((text) => text?.trim());
    const headerTextTransformed = headerText?.replace('  ', ' ');

    expect(headerTextTransformed).toContain(
      `IBF PORTAL ${countryName} ${disasterName}`,
    );
  }

  async allUserStateElementsAreVisible({
    firstName,
    lastName,
  }: {
    firstName: string;
    lastName: string;
  }) {
    await expect(this.dashboardHomeButton).toBeVisible();
    await expect(this.countryLogos).toBeVisible(); // skip-reason: test fails often because it claims the element is hidden instead of visible
    await expect(this.userLoggedInLabel).toHaveText(
      `Logged In As:${firstName} ${lastName}`,
    );
    await expect(this.logOutButton).toBeVisible();
  }

  async logOut() {
    await this.logOutButton.click();
  }
}

export default UserStateComponent;
