import test, { expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test(
    qase(
      43,
      'Number of events should match the number of events in aggregates component',
    ),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=43',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { chat, userState, aggregates } = components;

      if (!dashboard || !chat || !userState || !aggregates) {
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

      // get the number of warning events and aggregated events
      const chatEventCount = await chat.predictionButtonsAreActive();
      const aggregatesEventCount =
        await aggregates.getNumberOfPredictedEvents();

      // check if the number of warning events is equal to the number of aggregated events
      expect(chatEventCount).toEqual(aggregatesEventCount);
    },
  );
};
