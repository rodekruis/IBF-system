import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[33717] Click on area in triggered areas list in chat', async () => {
    const { dashboard } = pages;
    const { chat, userState, aggregates, map } = components;

    if (!dashboard || !chat || !userState || !aggregates || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await chat.chatColumnIsVisibleForTriggerState({
      user: dataset.user,
      date,
    });
    await map.assertTriggerOutlines({ visible: true });
    await chat.predictionButtonsAreActive();
    await chat.clickTriggerShowPredictionButton();
    await map.clickOnAdminBoundary();
    await chat.validateEapList();

    const adminAreaName = await map.getAdminAreaBreadCrumbText();
    await chat.validateChatTitleAndBreadcrumbs({
      district: adminAreaName,
      mainExposureUnit: 'Exposed Population',
    });
    await chat.validateEapListButtons();
  });
};
