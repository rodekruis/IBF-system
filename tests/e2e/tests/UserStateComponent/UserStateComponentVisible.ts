import test from '@playwright/test';
import UserStateComponent from 'Pages/UserStateComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33025] should be visible', async ({ page }) => {
    const userState = new UserStateComponent(page);

    await userState.headerComponentIsVisible(dataset);
    await userState.allUserStateElementsAreVisible(dataset.user);
  });
};
