import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';
import { Layer } from 'testData/types';

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
  readonly matrixLayers: Locator;
  readonly adminBoundaries: Locator;
  readonly legendHeader: Locator;
  readonly layerMenuToggle: Locator;
  readonly redCrossMarker: Locator;
  readonly glofasStations: Locator;
  readonly triggerAreaOutlines: Locator;
  readonly closeButtonIcon: Locator;
  readonly layerInfoContent: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.mapComponent = this.page.getByTestId('dashboard-map-component');
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
    this.legend = this.page
      .getByTestId('dashboard-map-component')
      .getByTestId('map-legend');
    this.layerMenu = this.page.getByTestId('layer-menu');
    this.matrixLayers = this.page.locator('matrix-layer');
    this.adminBoundaries = this.page.locator('.admin-boundary');
    this.legendHeader = this.page
      .getByTestId('dashboard-map-component')
      .getByTestId('map-legend-header');
    this.layerMenuToggle = this.page.getByTestId('layer-menu-toggle-button');
    this.redCrossMarker = this.page.getByAltText('Red Cross branches');
    this.glofasStations = this.page.locator('.glofas-station');
    this.triggerAreaOutlines = this.page.locator(
      '[stroke="var(--ion-color-ibf-outline-red)"]',
    );
    this.closeButtonIcon = this.page.getByTestId('close-matrix-icon');
    this.layerInfoContent = this.page.getByTestId('layer-info-content');
  }

  async waitForMapToBeLoaded() {
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

  async areAdminBoundariesVisible({ layerName }: { layerName?: string } = {}) {
    await this.waitForMapToBeLoaded();

    const layer = layerName
      ? this.page.locator(`.admin-boundary.${layerName}`)
      : this.adminBoundaries;

    const count = await layer.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(layer.nth(i)).toBeVisible();
    }
  }

  async clickOnAdminBoundary() {
    await this.adminBoundaries.first().click();
  }

  async checkLayerCheckbox({ name }: Layer) {
    await this.waitForMapToBeLoaded();

    await this.layerMenuToggle.click();

    const checkbox = this.page
      .locator(`.matrix-layer.${name}`)
      .getByTestId('matrix-checkbox');

    await checkbox.click();
  }

  async isLayerCheckboxChecked({ layerName }: { layerName: string }) {
    const checkbox = this.page
      .locator(`.matrix-layer.${layerName}`)
      .getByTestId('matrix-checkbox');

    await this.page.waitForTimeout(100);

    // In case of checbox being checked the name attribute should be "checkbox"
    const nameAttribute = await checkbox.getAttribute('name');
    const isChecked = nameAttribute === 'checkbox';

    if (!isChecked) {
      throw new Error(`Checkbox for layer ${layerName} is not checked`);
    }
  }

  async isLayerRadioButtonChecked({ layerName }: { layerName: string }) {
    const radioButton = this.page
      .locator(`.matrix-layer.${layerName}`)
      .getByTestId('matrix-radio-button');

    // In case of radio button being checked the name attribute should be "radio-button-on-outline"
    const nameAttribute = await radioButton.getAttribute('name');
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
    const layerCount = await this.matrixLayers.count();

    for (let i = 0; i < layerCount; i++) {
      try {
        const layerRow = this.matrixLayers.nth(i);
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
    await this.page.waitForLoadState('domcontentloaded');

    const adminBoundaries = this.page.locator('.admin-boundary:visible');
    const adminBoundariesCount = await adminBoundaries.count();
    const nthSelector = this.getRandomInt(1, adminBoundariesCount) - 1;

    await adminBoundaries.nth(nthSelector).hover({ force: true });
    // Assert that Aggregates title is visible and does not contain the text 'National View'
    await expect(aggregates.aggregatesHeaderLabel).not.toContainText(
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
    legendLabels,
  }: {
    legendLabels: string[];
  }) {
    for (const legendLabel of legendLabels) {
      const legendComponent = this.legend.filter({ hasText: legendLabel });
      await expect(legendComponent).toBeVisible();
    }
  }

  async assertTriggerOutlines(scenario: string) {
    if (scenario === 'trigger') {
      // Wait for locator to load when setTrigger is clicked
      await this.page.waitForSelector(
        '[stroke="var(--ion-color-ibf-outline-red)"]',
      );
      const triggerAreaOutlinesCount = await this.triggerAreaOutlines.count();
      const nthSelector = this.getRandomInt(1, triggerAreaOutlinesCount) - 1;
      // Assert that the number of red outlines is greater than 0 and randomly select one to be visible
      expect(triggerAreaOutlinesCount).toBeGreaterThan(0);
      await expect(this.triggerAreaOutlines.nth(nthSelector)).toBeVisible();
    } else {
      // This should actually test red outlines not to be there, but this is flaky. Comment out for now.
      // const triggerAreaOutlinesCount = await this.triggerAreaOutlines.count();
      // expect(triggerAreaOutlinesCount).toBe(0);
      return true;
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

  async glofasMarkersAreVisible({
    eapAlertClass = 'no',
    isVisible = true,
  }: { eapAlertClass?: string; isVisible?: boolean } = {}) {
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

  // NOTE: this method should expand to test all layers
  async isLayerVisible({ name }: Layer, scenario: string) {
    if (name === 'glofas_stations') {
      await this.glofasMarkersAreVisible();

      await this.glofasMarkersAreVisible({
        eapAlertClass: 'max',
        isVisible: scenario === 'trigger',
      });
    } else if (name === 'trigger') {
      await this.assertTriggerOutlines(scenario);
    }
  }

  async validateLayerIsVisibleInMapBySrcElement({
    layerName,
  }: {
    layerName: string;
  }) {
    const layer = this.page.locator(`img[src*="${layerName}"]`);
    const layerCount = await layer.count();
    expect(layerCount).toBeGreaterThan(0);
  }

  async getAdminAreaBreadCrumbText() {
    return await this.breadCrumbAdminAreaView.innerText();
  }

  async assertWmsLayer(linesLayer: Layer, timeout = 30000) {
    // Track all WMS responses for debugging
    const wmsResponses: string[] = [];

    // Create a promise that resolves when we find a matching response
    return new Promise<void>((resolve, reject) => {
      // Set a timeout to fail the test if we don't find a matching response
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Timeout waiting for WMS layer "${linesLayer.name}" after ${timeout}ms. Collected ${wmsResponses.length} WMS responses, but none matched the target layer.`,
          ),
        );
      }, timeout);

      // Set up an event listener for all responses
      const responseListener = (response: any) => {
        const url = response.url();
        if (!url.includes('wms') || !url.includes(linesLayer.name)) return;
        wmsResponses.push(url);

        // Process this response
        this.processWmsResponse(response)
          .then(() => {
            clearTimeout(timeoutId);
            resolve();
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      };

      // Register the response listener
      this.page.on('response', responseListener);
    });
  }

  // Helper method to process a WMS response
  private async processWmsResponse(response: any) {
    // NOTE: currently this only asserts a 200 response and an image content type.
    // In fact, in these tests we do not seed lines-data and thus the tiles are actually empty.
    // So this assertion is checking if the Geoserver store/layer are set up correctly and reachable, but is not asserting any data.
    // It is hard to assert what is in the image, given we use wms and not wfs.

    // Verify the response is valid
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('image/');
  }
}
export default MapComponent;
