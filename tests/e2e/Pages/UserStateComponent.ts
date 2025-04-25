import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';
import { Country, Dataset, User } from 'testData/types';

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

  async headerComponentIsVisible({ country: { name }, title }: Dataset) {
    const header = this.header.filter({ hasText: `${title} ${name}` });
    await expect(header).toBeVisible();
  }

  async headerComponentDisplaysCorrectDisasterType({
    country: { name },
    disasterType,
    title,
  }: {
    country: Country;
    disasterType: string;
    title: string;
  }) {
    const header = this.header.filter({ hasText: `${title} ${name}` });
    const headerText = await header.textContent().then((text) => text?.trim());
    const headerTextTransformed = headerText?.replace('  ', ' '); // REFACTOR

    expect(headerTextTransformed).toContain(`${title} ${name} ${disasterType}`);
  }

  async allUserStateElementsAreVisible({ firstName, lastName }: User) {
    const countryLogosCount = await this.countryLogos.count();
    for (let i = 0; i < countryLogosCount; i++) {
      await expect(this.countryLogos.nth(i)).toBeVisible();
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
