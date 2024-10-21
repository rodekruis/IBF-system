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
  readonly layerMenuToggle: Locator;

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
    this.layerMenuToggle = this.page.getByTestId('layer-menu-toggle-button');
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

  async turnOffLayer({ layerName }: { layerName: string }) {
    // Remove Glofas station from the map (in case the mock is for floods)
    await this.layerMenuToggle.click();
    const getLayerRow = this.page
      .getByTestId('matrix-layer-name')
      .filter({ hasText: layerName });
    const layerCheckbox = getLayerRow.locator(this.layerCheckbox);
    await layerCheckbox.click();
  }

  async assertAggregateTitleOnHoverOverMap() {
    // Declare component
    const aggregates = new AggregatesComponent(this.page);

    // Wait for the page to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('.leaflet-interactive');

    // Assert the that Aggregates title is visible and does not contain the text 'National View'

    await this.adminBoundry.first().hover();
    await expect(aggregates.aggregatesTitleHeader).not.toContainText(
      'National View',
    );
  }
}

export default MapComponent;
