import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(4, 'Logout should load login page'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=4',
      },
    },
    async () => {
      const { login, dashboard } = pages;
      const { userState } = components;

      if (!login || !dashboard || !userState) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToDisasterType(disasterType);
      // Assertions
      await userState.headerComponentIsVisible({
        countryName: NoTriggerDataSet.CountryName,
      });
      await userState.logOut();
      await login.loginScreenIsVisible();

      // Reload the page to prepare for next test
      await dashboard.page.goto('/');
      await dashboard.page.waitForTimeout(1000);
    },
  );
};
