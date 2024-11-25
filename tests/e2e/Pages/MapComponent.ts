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
  readonly adminBoundry: Locator;
  readonly layerCheckbox: Locator;
  readonly legendHeader: Locator;
  readonly layerMenuToggle: Locator;
  readonly redCrossMarker: Locator;
  readonly gloFASMarker: Locator;
  readonly alerThresholdLines: Locator;
  readonly closeButtonIcon: Locator;
  readonly layerInfoContent: Locator;

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
    this.adminBoundry = this.page.locator('.leaflet-interactive');
    this.layerCheckbox = this.page.getByTestId('matrix-checkbox');
    this.legendHeader = this.page.getByTestId('map-legend-header');
    this.layerMenuToggle = this.page.getByTestId('layer-menu-toggle-button');
    this.redCrossMarker = this.page.getByAltText('Red Cross branches');
    this.gloFASMarker = this.page.getByAltText('Glofas stations');
    this.alerThresholdLines = this.page.locator(
      '[stroke="var(--ion-color-ibf-outline-red)"]',
    );
    this.closeButtonIcon = this.page.getByTestId('close-matrix-icon');
    this.layerInfoContent = this.page.getByTestId('layer-info-content');
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
    if (layerMenuOpen) {
      await expect(this.layerMenu).toBeVisible();
    } else {
      await expect(this.layerMenu).toBeHidden();
    }
  }

  async assertAdminBoundariesVisible() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    // await this.page.waitForTimeout(500); // This is a workaround for the issue with the map not loading in the same moment as the dom
    await this.page.waitForSelector('.leaflet-interactive');

    const adminBoundaries = this.adminBoundry;
    const count = await adminBoundaries.count();

    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(adminBoundaries.nth(i)).toBeVisible();
    }
  }

  async clickLayerCheckbox({ layerName }: { layerName: string }) {
    // Remove Glofas station from the map (in case the mock is for floods)
    await this.layerMenuToggle.click();
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

  async retryGetAttribute(locator: Locator, attribute: string, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await locator.getAttribute(attribute);
      } catch (error) {
        console.log(`Retry ${attempt + 1} for attribute ${attribute} failed`);
        if (attempt === retries - 1) throw error;
      }
    }
  }

  async returnLayerCheckedCheckboxes() {
    const getLayerRow = this.page.getByTestId('matrix-layer-name');
    const layerCount = await getLayerRow.count();

    const availableLayers = [];
    for (let i = 0; i < layerCount; i++) {
      try {
        const layerCheckbox = getLayerRow.nth(i).locator(this.layerCheckbox);
        if (await layerCheckbox.isVisible()) {
          const nameAttribute = await this.retryGetAttribute(
            layerCheckbox,
            'name',
          );
          if (nameAttribute === 'checkbox') {
            const layerName = await getLayerRow.nth(i).textContent();
            if (layerName) {
              availableLayers.push(layerName.trim());
            }
          }
        }
      } catch (error) {
        // Handle errors without stopping the loop
      }
    }
    return availableLayers;
  }

  async asserAllInfoIconsIntercations() {
    const getLayerRow = this.page.getByTestId('matrix-layer-name');
    const layerCount = await getLayerRow.count();
    console.log('layerCount: ', layerCount);

    const availableLayers = [];
    for (let i = 0; i < layerCount; i++) {
      try {
        const layerRow = getLayerRow.nth(i);
        if (await layerRow.isVisible()) {
          const nameAttribute = await getLayerRow.nth(i).textContent();
          console.log(i);
          if (nameAttribute) {
            availableLayers.push(nameAttribute.trim());
          }
          console.log('availableLayers: ', availableLayers[i]);
          await this.page
            .locator('ion-item')
            .filter({ hasText: availableLayers[i] })
            .getByRole('button')
            .click();
          await expect(
            this.page
              .locator('ion-card-header')
              .filter({ hasText: availableLayers[i] }),
          ).toHaveText(availableLayers[i]);
          await expect(this.layerInfoContent).toBeVisible();
          await this.closeButtonIcon.click();
        }
      } catch (error) {
        // Handle errors without stopping the loop
      }
    }
    return availableLayers;
  }

  async assertAggregateTitleOnHoverOverMap() {
    // Declare component
    const aggregates = new AggregatesComponent(this.page);

    // Wait for the page to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('.leaflet-interactive');

    // Assert that Aggregates title is visible and does not contain the text 'National View'

    await this.adminBoundry.first().hover();
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

  async assertAlertThresholdLines({ visible = false }: { visible: boolean }) {
    if (visible === true) {
      const alertThresholdLinesCount = await this.alerThresholdLines.count();
      const nthSelector = this.getRandomInt(1, alertThresholdLinesCount);
      // Assert that the number of alerThresholdLines is greater than 0 and randomly select one to be visible
      expect(alertThresholdLinesCount).toBeGreaterThan(0);
      await expect(this.alerThresholdLines.nth(nthSelector)).toBeVisible();
    } else {
      await expect(this.alerThresholdLines).toBeHidden();
    }
  }

  async redCrossMarkersAreVisible() {
    // Wait for the page to load
    await this.page.waitForSelector('[alt="Red Cross branches"]');

    // Count the number of red cross markers
    const redCrossMarkersCount = await this.redCrossMarker.count();
    const nthSelector = this.getRandomInt(1, redCrossMarkersCount);

    // Assert that the number of red cross markers is greater than 0 and randomly select one to be visible
    expect(redCrossMarkersCount).toBeGreaterThan(0);
    await expect(this.redCrossMarker.nth(nthSelector)).toBeVisible();
  }

  async gloFASMarkersAreVisible() {
    // Wait for the page to load
    await this.page.waitForSelector('[alt="Glofas stations"]');

    // Count the number of gloFAS markers
    const gloFASMarkersCount = await this.gloFASMarker.count();
    const nthSelector = this.getRandomInt(1, gloFASMarkersCount);

    // Assert that the number of gloFAS markers is greater than 0 and randomly select one to be visible
    expect(gloFASMarkersCount).toBeGreaterThan(0);
    await expect(this.gloFASMarker.nth(nthSelector)).toBeVisible();
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
      const nthSelector = this.getRandomInt(1, markersCount);

      // Assert that the number of gloFAS markers is greater than 0 and randomly select one to be visible
      expect(markersCount).toBeGreaterThan(0);
      await expect(layer.nth(nthSelector)).toBeVisible();
    }
  }

  async gloFASMarkersAreVisibleByWarning({
    glosfasStationStatus,
    isVisible,
  }: {
    glosfasStationStatus: string;
    isVisible: boolean;
  }) {
    // Select from: ""glofas-station-max-trigger", "glofas-station-med-trigger", "glofas-station-min-trigger"
    // We don't have specyfic selectors for each of the markers, so we need have to use src as a selector which is not ideal
    const glofasMarker = this.page.locator(
      `img[src="assets/markers/${glosfasStationStatus}.svg"][alt="Glofas stations"]`,
    );

    if (isVisible) {
      const markersCount = await glofasMarker.count();
      const nthSelector = this.getRandomInt(0, markersCount - 1);

      expect(markersCount).toBeGreaterThan(0);
      await expect(glofasMarker.nth(nthSelector)).toBeVisible();
    } else {
      // Assert that no markers are visible
      expect(await glofasMarker.count()).toBe(0);
    }
  }
}
export default MapComponent;
