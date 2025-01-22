import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
  date: Date,
) => {
  test(
    qase(45, 'Info icon should open popover on click'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=45',
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
        countryName: TriggerDataSet.CountryName,
      });
      await chat.chatColumnIsVisibleForTriggerState({
        firstName: TriggerDataSet.firstName,
        lastName: TriggerDataSet.lastName,
        date,
      });
      await chat.validateEventsInfoButtonsAreClickable();

      // Reload the page to prepare for next test
      await dashboard.page.goto('/');
      await dashboard.page.waitForTimeout(1000);
    },
  );
};
