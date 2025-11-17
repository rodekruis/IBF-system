import test from '@playwright/test';
import MapComponent from 'Pages/MapComponent';

export default () => {
  // REFACTOR: this test keeps being flaky, it should be refactored to be more stable
  test.skip('[33059] should change title based on district hover', async ({
    page,
  }) => {
    const map = new MapComponent(page);

    await map.clickLegendHeader();
    // REFACTOR: should this be in aggregates?
    await map.assertAggregateTitleOnHoverOverMap();
  });
};
