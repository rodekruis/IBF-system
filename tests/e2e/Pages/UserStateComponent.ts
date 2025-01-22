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
    this.countryLogos = this.page.getByTestId('logo-image');
    this.userLoggedInLabel = this.page.getByTestId('user-display-name');
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
    const countryLogosCount = await this.countryLogos.count();
    for (let i = 0; i < countryLogosCount; i++) {
      await expect(this.countryLogos.nth(i)).toBeVisible();
      console.log(i);
    }

    await expect(this.dashboardHomeButton).toBeVisible();
    await expect(this.userLoggedInLabel).toHaveText(`${firstName} ${lastName}`);
    await expect(this.logOutButton).toBeVisible();
  }

  async logOut() {
    await this.logOutButton.click();
  }
}

export default UserStateComponent;
