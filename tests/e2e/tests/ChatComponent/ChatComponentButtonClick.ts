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
    qase(11, 'Action buttons should be clickable'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=11',
      },
    },
    async () => {
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

      // Reload the page to prepare for next test
      await dashboard.page.goto('/');
      await dashboard.page.waitForTimeout(1000);
    },
  );
};
