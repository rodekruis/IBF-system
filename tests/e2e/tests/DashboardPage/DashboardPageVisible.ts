import test from '@playwright/test';
import { NoTriggerDataSet } from 'testData/testData.enum';
import { DisasterTypeEnum } from 'tests/ScenarioNoTrigger.spec';

import { Components, Pages } from '../../helpers/interfaces';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  disasterType: DisasterTypeEnum,
) => {
  test(`[33012] Dashboard page elements should be visible - ${disasterType}`, async () => {
    const { dashboard } = pages;
    const {
      chat,
      userState,
      aggregates,
      map,
      disasterType: disasterTypeComponent,
    } = components;

    if (
      !dashboard ||
      !chat ||
      !userState ||
      !aggregates ||
      !map ||
      !disasterTypeComponent
    ) {
      throw new Error('pages and components not found');
    }
    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(disasterType);
    // Assertions
    await userState.headerComponentIsVisible({
      countryName: NoTriggerDataSet.CountryName,
    });
    await disasterTypeComponent.topBarComponentIsVisible();
    await chat.chatColumnIsVisibleForNoTriggerState({
      firstName: NoTriggerDataSet.firstName,
      lastName: NoTriggerDataSet.lastName,
      disasterType,
    });
    await aggregates.aggregateComponentIsVisible();
    await map.mapComponentIsVisible();

    // Reload the page to prepare for next test
    await dashboard.page.goto('/');
    await dashboard.page.waitForTimeout(1000);
  });
};
