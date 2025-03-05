import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33026] Logout should load login page', async () => {
    const { login, dashboard } = pages;
    const { userState } = components;

    if (!login || !dashboard || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await userState.logOut();
    await login.loginScreenIsVisible();
  });
};
