import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33717] should allow alert area click', async ({ page }) => {
    const chat = new ChatComponent(page);
    const map = new MapComponent(page);

    await map.assertTriggerOutlines(dataset.scenario);
    await chat.predictionButtonsAreActive();
    if (
      !(
        dataset.country.code === 'UGA' &&
        dataset.disasterType.name === 'drought' &&
        dataset.scenario === 'warning'
      )
      // HACK: workaround coz it auto-navigates to event view
    ) {
      await chat.clickShowPredictionButton(dataset.scenario);
    }
    await map.clickOnAdminBoundary();

    // Assertions
    await chat.validateEapList(dataset.eap.actions);
    const adminAreaName = await map.getAdminAreaBreadCrumbText();
    await chat.validateChatTitleAndBreadcrumbs({
      adminAreaName,
      mainExposureIndicator: 'Exposed Population',
      defaultAdminAreaLabelSingular:
        dataset.country.defaultAdminAreaLabelSingular,
    });
    await chat.validateEapListButtons();
  });
};
