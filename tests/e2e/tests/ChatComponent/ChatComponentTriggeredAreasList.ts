import test from '@playwright/test';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
  date: Date,
) => {
  test('[33717] Click on area in triggered areas list in chat', async () => {
    const { dashboard } = pages;
    const { chat, userState, aggregates, map } = components;

    if (!dashboard || !chat || !userState || !aggregates || !map) {
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
    await map.assertTriggerOutlines({ visible: true });
    await chat.predictionButtonsAreActive();
    await chat.clickTriggerShowPredictionButton();
    await map.clickOnAdminBoundary();
  });
};
