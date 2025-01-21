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
    qase(5, 'Chat component elements should be visible'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=5',
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
      await chat.chatColumnIsVisibleForNoTriggerState({
        firstName: NoTriggerDataSet.firstName,
        lastName: NoTriggerDataSet.lastName,
      });
      await chat.allDefaultButtonsArePresent();
    },
  );
};
