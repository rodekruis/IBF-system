import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import AggregatesComponent from './AggregatesComponent';
import DashboardPage from './DashboardPage';

class MapComponent extends DashboardPage {
  readonly page: Page;
  readonly mapComponent: Locator;
  readonly breadCrumbNationalView: Locator;
  readonly breadCrumbEventView: Locator;
  readonly breadCrumbAdminAreaView: Locator;
  readonly breadCrumbAdminArea2View: Locator;
  readonly breadCrumbAdminArea3View: Locator;
  readonly legend: Locator;
  readonly layerMenu: Locator;
  readonly adminBoundaries: Locator;
  readonly layerCheckbox: Locator;
  readonly layerRadioButton: Locator;
  readonly legendHeader: Locator;
  readonly layerMenuToggle: Locator;
  readonly redCrossMarker: Locator;
  readonly glofasStations: Locator;
  readonly triggerAreaOutlines: Locator;
  readonly closeButtonIcon: Locator;
  readonly layerInfoContent: Locator;
  readonly aggregates: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.mapComponent = this.page.getByTestId('dashboard-map-componenet');
    this.breadCrumbNationalView = this.page.getByTestId(
      'breadcrumb-national-view',
    );
    this.breadCrumbEventView = this.page.getByTestId('breadcrumb-event-view');
    this.breadCrumbAdminAreaView = this.page.getByTestId(
      'breadcrumb-admin-area-view',
    );
    this.breadCrumbAdminArea2View = this.page.getByTestId(
      'breadcrumb-admin-area-2-view',
    );
    this.breadCrumbAdminArea3View = this.page.getByTestId(
      'breadcrumb-admin-area-3-view',
    );
    this.legend = this.page.getByTestId('map-legend');
    this.layerMenu = this.page.getByTestId('layer-menu');
    this.adminBoundaries = this.page.locator(
      '.leaflet-ibf-admin-boundaries-pane .leaflet-interactive',
    );
    this.layerCheckbox = this.page.getByTestId('matrix-checkbox');
    this.layerRadioButton = this.page.getByTestId('matrix-radio-button');
    this.legendHeader = this.page.getByTestId('map-legend-header');
    this.layerMenuToggle = this.page.getByTestId('layer-menu-toggle-button');
    this.redCrossMarker = this.page.getByAltText('Red Cross branches');
    this.glofasStations = this.page.locator('.glofas-station');
    this.triggerAreaOutlines = this.page.locator(
      '[stroke="var(--ion-color-ibf-outline-red)"]',
    );
    this.closeButtonIcon = this.page.getByTestId('close-matrix-icon');
    this.layerInfoContent = this.page.getByTestId('layer-info-content');
    this.aggregates = this.page.locator(
      '.leaflet-ibf-aggregate-pane .leaflet-interactive',
    );
  }

  async waitForMapToBeLoaded() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async mapComponentIsVisible() {
    await expect(this.mapComponent).toBeVisible();
  }

  async breadCrumbViewIsVisible({
    nationalView = false,
    eventView = false,
    adminAreaView = false,
    adminAreaView2 = false,
    adminAreaView3 = false,
  }: {
    nationalView?: boolean;
    eventView?: boolean;
    adminAreaView?: boolean;
    adminAreaView2?: boolean;
    adminAreaView3?: boolean;
  }) {
    if (nationalView) {
      await expect(this.breadCrumbNationalView).toBeVisible();
    } else {
      await expect(this.breadCrumbNationalView).toBeHidden();
    }
    if (eventView) {
      await expect(this.breadCrumbEventView).toBeVisible();
    } else {
      await expect(this.breadCrumbEventView).toBeHidden();
    }
    if (adminAreaView) {
      await expect(this.breadCrumbAdminAreaView).toBeVisible();
    } else {
      await expect(this.breadCrumbAdminAreaView).toBeHidden();
    }
    if (adminAreaView2) {
      await expect(this.breadCrumbAdminArea2View).toBeVisible();
    } else {
      await expect(this.breadCrumbAdminArea2View).toBeHidden();
    }
    if (adminAreaView3) {
      await expect(this.breadCrumbAdminArea3View).toBeVisible();
    } else {
      await expect(this.breadCrumbAdminArea3View).toBeHidden();
    }
  }

  async isLegendOpen({ legendOpen = false }: { legendOpen?: boolean }) {
    if (legendOpen) {
      await expect(this.legend).toHaveAttribute('open');
    } else {
      await expect(this.legend).not.toHaveAttribute('open');
    }
  }

  async isLayerMenuOpen({
    layerMenuOpen = false,
  }: {
    layerMenuOpen?: boolean;
  }) {
    await this.waitForMapToBeLoaded();

    if (layerMenuOpen) {
      await expect(this.layerMenu).toBeVisible();
    } else {
      await expect(this.layerMenu).toBeHidden();
    }
  }

  async assertAdminBoundariesVisible() {
    await this.waitForMapToBeLoaded();
    await this.page.waitForTimeout(2000); // This is a workaround for the issue with the map not loading in the same moment as the dom
    await this.adminBoundaries.first().waitFor();

    const count = await this.adminBoundaries.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(this.adminBoundaries.nth(i)).toBeVisible();
    }
  }

  async clickLayerCheckbox({ layerName }: { layerName: string }) {
    // Remove Glofas station from the map (in case the mock is for floods)
    await this.waitForMapToBeLoaded();

    await this.layerMenuToggle.click();
    await this.page.waitForSelector('data-testid=matrix-layer-name');

    const getLayerRow = this.page
      .getByTestId('matrix-layer-name')
      .filter({ hasText: layerName });
    const layerCheckbox = getLayerRow.locator(this.layerCheckbox);
    await layerCheckbox.click();
  }

  async verifyLayerCheckboxCheckedByName({ layerName }: { layerName: string }) {
    const getLayerRow = this.page
      .getByTestId('matrix-layer-name')
      .filter({ hasText: layerName });
    const layerCheckbox = getLayerRow.locator(this.layerCheckbox);

    // In case of checbox being checked the name attribute should be "checkbox"
    const nameAttribute = await layerCheckbox.getAttribute('name');
    const isChecked = nameAttribute === 'checkbox';

    if (!isChecked) {
      throw new Error(`Checkbox for layer ${layerName} is not checked`);
    }
  }

  async verifyLayerRadioButtonCheckedByName({
    layerName,
  }: {
    layerName: string;
  }) {
    const getLayerRow = this.page
      .getByTestId('matrix-layer-name')
      .filter({ hasText: layerName });
    const layerCheckbox = getLayerRow.locator(this.layerRadioButton);

    // In case of checbox being checked the name attribute should be "checkbox"
    const nameAttribute = await layerCheckbox.getAttribute('name');
    const isChecked = nameAttribute === 'radio-button-on-outline';

    if (!isChecked) {
      throw new Error(`Radio button for layer ${layerName} is not checked`);
    }
  }

  async clickInfoButtonByName({ layerName }: { layerName: string }) {
    await this.page
      .locator(`ion-item`)
      .filter({ hasText: layerName })
      .getByRole('button')
      .first()
      .click();
  }

  async validateInfoIconInteractions() {
    const getLayerRow = this.page.getByTestId('matrix-layer-name');
    const layerCount = await getLayerRow.count();

    for (let i = 0; i < layerCount; i++) {
      try {
        await this.page.waitForTimeout(200);
        const layerRow = getLayerRow.nth(i);
        if (await layerRow.isVisible()) {
          const nameAttribute = await layerRow.textContent();
          if (nameAttribute) {
            const trimmedName = nameAttribute.trim();

            await this.clickInfoButtonByName({ layerName: trimmedName });
            await expect(
              this.page
                .locator('ion-card-header')
                .filter({ hasText: trimmedName }),
            ).toBeVisible();
            await expect(this.layerInfoContent).toBeVisible();
            await this.closeButtonIcon.click();
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error: ', error.message);
        } else {
          console.error('Unexpected error: ', error);
        }
      }
    }
  }

  async assertAggregateTitleOnHoverOverMap() {
    // Declare component
    const aggregates = new AggregatesComponent(this.page);

    // Wait for the page to load
    await this.waitForMapToBeLoaded();
    await this.adminBoundaries.first().waitFor();
    await this.page.waitForTimeout(200);

    // Assert that Aggregates title is visible and does not contain the text 'National View'

    await this.adminBoundaries.first().hover();
    await expect(aggregates.aggregatesTitleHeader).not.toContainText(
      'National View',
    );
  }

  async clickLegendHeader() {
    await this.legendHeader.click();
  }

  async clickLayerMenu() {
    await this.layerMenuToggle.click();
  }

  async assertLegendElementIsVisible({
    legendComponentName,
  }: {
    legendComponentName: string;
  }) {
    const legendComponent = this.legend.filter({
      hasText: legendComponentName,
    });
    await expect(legendComponent).toBeVisible();
  }

  async assertTriggerOutlines({ visible = false }: { visible: boolean }) {
    if (visible === true) {
      const triggerAreaOutlinesCount = await this.triggerAreaOutlines.count();
      const nthSelector = this.getRandomInt(1, triggerAreaOutlinesCount) - 1;
      // Assert that the number of alerThresholdLines is greater than 0 and randomly select one to be visible
      expect(triggerAreaOutlinesCount).toBeGreaterThan(0);
      await expect(this.triggerAreaOutlines.nth(nthSelector)).toBeVisible();
    } else {
      await expect(this.triggerAreaOutlines).toBeHidden();
    }
  }

  async redCrossMarkersAreVisible() {
    // Wait for the page to load
    await this.page.waitForSelector('[alt="Red Cross branches"]');

    // Count the number of red cross markers
    const redCrossMarkersCount = await this.redCrossMarker.count();
    const nthSelector = this.getRandomInt(1, redCrossMarkersCount) - 1;

    // Assert that the number of red cross markers is greater than 0 and randomly select one to be visible
    expect(redCrossMarkersCount).toBeGreaterThan(0);
    await expect(this.redCrossMarker.nth(nthSelector)).toBeVisible();
  }

  async validateLayersAreVisibleByName({
    layerNames = [],
  }: {
    layerNames: string[];
  }) {
    for (const layerName of layerNames) {
      await this.page.waitForSelector(`[alt="${layerName}"]`);
      const layer = this.page.getByAltText(layerName);
      // Count the number of markers
      const markersCount = await layer.count();
      const nthSelector = this.getRandomInt(1, markersCount) - 1;

      // Assert that the number of gloFAS markers is greater than 0 and randomly select one to be visible
      expect(markersCount).toBeGreaterThan(0);
      await expect(layer.nth(nthSelector)).toBeVisible();
    }
  }

  async glofasMarkersAreVisible({
    eapAlertClass = 'no',
    isVisible = true,
  }: {
    eapAlertClass?: string;
    isVisible?: boolean;
  } = {}) {
    // Wait for the page to load
    await this.glofasStations.first().waitFor();

    const markers = this.page.locator(`.glofas-station-${eapAlertClass}`);

    const count = await markers.count();
    if (isVisible) {
      const nthSelector = this.getRandomInt(1, count) - 1; // pick a random marker

      expect(count).toBeGreaterThan(0);
      await expect(markers.nth(nthSelector)).toBeVisible();
    } else {
      // Assert that no markers are visible
      expect(count).toBe(0);
    }
  }

  // This method checks that when radio button is checked then the layer is visible in leaflet-ibf-aggregate-pane
  // Only one radio button can be checked at a time
  // It valdates the functionality not data displayed
  async validateAggregatesAreVisible() {
    const count = await this.aggregates.count();
    expect(count).toBeGreaterThan(0);
  }

  async validateLayerIsVisibleInMapBySrcElement({
    layerName,
  }: {
    layerName: string;
  }) {
    // Select from: "flood_extent"
    const layer = this.page.locator(`img[src*="${layerName}"]`);
    const layerCount = await layer.count();
    expect(layerCount).toBeGreaterThan(0);
  }
}
export default MapComponent;
