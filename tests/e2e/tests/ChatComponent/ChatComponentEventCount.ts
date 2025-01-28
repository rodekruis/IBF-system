import test, { expect } from '@playwright/test';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
  date: Date,
) => {
  test('[33056] Number of events should match the number of events in aggregates component', async () => {
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
      date,
    });
    await chat.allDefaultButtonsArePresent();

    // get the number of warning events and aggregated events
    const chatEventCount = await chat.predictionButtonsAreActive();
    const aggregatesEventCount = await aggregates.getNumberOfPredictedEvents();

    // check if the number of warning events is equal to the number of aggregated events
    expect(chatEventCount).toEqual(aggregatesEventCount);

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
