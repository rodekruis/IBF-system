import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33054] should allow action buttons click', async ({ page }) => {
    const chat = new ChatComponent(page);

    await chat.clickAndAssertAboutButton();
    await chat.clickAndAssertGuideButton();
    await chat.clickAndAssertExportViewButton();
    await chat.clickAndAssertTriggerLogButton({
      url: `/log?countryCodeISO3=${dataset.country.code}&disasterType=${dataset.disasterType.name}`,
    });
  });
};
