import test from '@playwright/test';
import MapComponent from 'Pages/MapComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset) => {
  test('[33013] should be visible', async ({ page }) => {
    const map = new MapComponent(page);

    await map.mapComponentIsVisible();
    const breadcrumbView = {
      nationalView: true,
      eventView:
        dataset.country.code === 'UGA' &&
        dataset.disasterType.name === 'drought' &&
        dataset.scenario === 'warning',
      // HACK: workaround coz it auto-navigates to event view
    };
    await map.breadCrumbViewIsVisible(breadcrumbView);
    await map.isLegendOpen({ legendOpen: true });
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.areAdminBoundariesVisible();
  });
};
