import test from '@playwright/test';
import MapComponent from 'Pages/MapComponent';

export default () => {
  test('[33020] should open popover on info icon click', async ({ page }) => {
    const map = new MapComponent(page);

    // Open the layer menu
    await map.isLayerMenuOpen({ layerMenuOpen: false });
    await map.clickLayerMenu();
    await map.isLayerMenuOpen({ layerMenuOpen: true });

    // Assert layer info icons to be intercative and contain basic required info
    await map.validateInfoIconInteractions();
  });
};
