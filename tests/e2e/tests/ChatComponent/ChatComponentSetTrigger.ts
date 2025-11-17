import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[34458] should allow set trigger for warnings', async ({ page }) => {
    const dashboard = new DashboardPage(page);
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
    await dashboard.waitForLoaderToDisappear(); // because  set trigger reloads the page

    await map.assertTriggerOutlines('trigger');
  });
};
