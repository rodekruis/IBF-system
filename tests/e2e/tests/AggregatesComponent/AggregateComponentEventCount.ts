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
    qase(39, 'Number of events should be non-zero'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=39',
      },
    },
    async () => {
      const { dashboard } = pages;
      const { aggregates, userState } = components;

      if (!dashboard || !aggregates || !userState) {
        throw new Error('pages and components not found');
      }

      // Navigate to disaster type the data was mocked for
      await dashboard.navigateToDisasterType(disasterType);
      // Assertions
      await userState.headerComponentIsVisible({
        countryName: TriggerDataSet.CountryName,
      });

      // get the number of warning events and aggregated events
      const aggregatesEventCount =
        await aggregates.getNumberOfPredictedEvents();

      // check if the number of warning events is equal to the number of aggregated events
      expect(aggregatesEventCount).toBeGreaterThan(0);
    },
  );
};
