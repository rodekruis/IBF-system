import test from '@playwright/test';
import { TriggerDataSet } from 'testData/testData.enum';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: string,
) => {
  test('[33067] Info icon is clickable and opens popover in Actions summary', async () => {
    const { dashboard } = pages;
    const { userState } = components;
    const { actionsSummary } = components;

    if (!userState || !actionsSummary || !dashboard) {
      throw new Error('pages and components not found');
    }

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: TriggerDataSet.CountryName,
    });
    // Wait for the sharedPage to load
    await dashboard.waitForLoaderToDisappear();

    await actionsSummary.validateActionsSummaryInfoButtons();
  });
};
