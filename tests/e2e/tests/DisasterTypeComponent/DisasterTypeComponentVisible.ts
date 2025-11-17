import test from '@playwright/test';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33028] should be visible', async ({ page }) => {
    const disasterType = new DisasterTypeComponent(page);

    await disasterType.topBarComponentIsVisible();
    await disasterType.allDisasterTypeElementsArePresent(
      dataset.country.disasterTypes,
    );
  });
};
