import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
) => {
  test('[33054] Action buttons should be clickable', async () => {
    const { dashboard } = pages;
    const { chat, userState } = components;

    if (!dashboard || !chat || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();
    await chat.allDefaultButtonsArePresent();
    await chat.clickAndAssertAboutButton();
    await chat.clickAndAssertGuideButton();
    await chat.clickAndAssertExportViewButton();
    await chat.clickAndAssertTriggerLogButton({
      url: `/log?countryCodeISO3=${dataset.country.code}&disasterType=${dataset.disasterType.name}`,
    });
  });
};
