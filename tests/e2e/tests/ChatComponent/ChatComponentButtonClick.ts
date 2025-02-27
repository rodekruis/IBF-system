import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33054] Action buttons should be clickable', async () => {
    const { dashboard } = pages;
    const { chat, userState } = components;

    if (!dashboard || !chat || !userState) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await chat.allDefaultButtonsArePresent();
    await chat.clickAndAssertAboutButton();
    await chat.clickAndAssertGuideButton();
    await chat.clickAndAssertExportViewButton();
    await chat.clickAndAssertTriggerLogButton({
      url: `/log?countryCodeISO3=${NoTriggerDataSet.CountryCode}&disasterType=${disasterType}`,
    });
  });
};
