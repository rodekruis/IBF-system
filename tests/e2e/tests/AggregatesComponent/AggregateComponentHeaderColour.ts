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
    qase(40, 'Header colour should be purple'),
    {
      annotation: {
        type: 'url',
        description: 'https://app.qase.io/project/IBF?case=40',
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

      // Validate that the aggregates header is purple by class
      await aggregates.validateColorOfAggregatesHeaderByClass({
        isTrigger: true,
      });
    },
  );
};
