import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[34458] should allow set trigger for warnings', async ({ page }) => {
    const chat = new ChatComponent(page);
    const map = new MapComponent(page);

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
    await chat.setTrigger();

    await page.waitForSelector('[data-testid=loader]', { state: 'hidden' }); // because  set trigger reloads the page

    await map.assertTriggerOutlines('trigger');
  });
};
