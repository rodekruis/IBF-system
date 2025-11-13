import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[33717] Click on area in affected areas list in chat', async () => {
    const { dashboard } = pages;
    const { chat, userState, aggregates, map } = components;

    if (!dashboard || !chat || !userState || !aggregates || !map) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    await userState.headerComponentIsVisible(dataset);
    // Wait for the page to load
    await dashboard.waitForLoaderToDisappear();

    await chat.chatColumnIsVisible({ date, scenario: dataset.scenario });
    await map.assertTriggerOutlines(dataset.scenario);
    await chat.predictionButtonsAreActive();
    await chat.clickShowPredictionButton(dataset.scenario);
    await map.clickOnAdminBoundary();

    // Assertions
    await chat.validateEapList(dataset.eap.actions);
    const adminAreaName = await map.getAdminAreaBreadCrumbText();
    await chat.validateChatTitleAndBreadcrumbs({
      adminAreaName,
      mainExposureIndicator: 'Exposed Population',
      defaultAdminAreaLabelSingular:
        dataset.country.defaultAdminAreaLabelSingular,
    });
    await chat.validateEapListButtons();
  });
};
