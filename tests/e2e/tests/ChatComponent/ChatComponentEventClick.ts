import test from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(44, 'Show prediction button should be clickable'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=44',
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
      });
      await chat.allDefaultButtonsArePresent();
      await chat.predictionButtonsAreActive();
    },
  );
};
