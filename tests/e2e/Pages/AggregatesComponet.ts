import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

const expectedLayersNames = [
  'Exposed population',
  'Total Population',
  'Female-headed household',
  'Population under 8',
  'Population over 65',
];

class AggregatesComponent extends DashboardPage {
  readonly page: Page;
  readonly aggregateSectionColumn: Locator;
  readonly aggregatesTitleHeader: Locator;
  readonly aggregatesInfoIcon: Locator;
  readonly aggregatesLayerRow: Locator;
  readonly aggregatesAffectedNumber: Locator;
  readonly aggreagtesTitleInfoIcon: Locator;
  readonly approximatedisclaimer: Locator;
  readonly popoverLayer: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.aggregateSectionColumn = this.page.getByTestId(
      'dashboard-aggregate-section',
    );
    this.aggregatesTitleHeader = this.page.getByTestId('action-title');
    this.aggregatesInfoIcon = this.page.getByTestId('aggregates-info-icon');
    this.aggregatesLayerRow = this.page.getByTestId('aggregates-row');
    this.aggregatesAffectedNumber = this.page.getByTestId(
      'aggregates-affected-number',
    );
    this.aggreagtesTitleInfoIcon = this.page.getByTestId(
      'aggregates-title-info-icon',
    );
    this.approximatedisclaimer = this.page.getByTestId(
      'disclaimer-approximate-message',
    );
    this.popoverLayer = this.page.getByTestId('disclaimer-popover-layer');
  }

  async aggregateComponentIsVisible() {
    await expect(this.aggregateSectionColumn).toBeVisible();
    await expect(this.aggregateSectionColumn).toContainText('National View');
  }

  async aggregatesAlementsDisplayedInNoTrigger() {
    // Wait for the page to load
    await this.page.waitForSelector('[data-testid="loader"]', {
      state: 'hidden',
    });
    await this.page.waitForSelector('[data-testid="aggregates-row"]');

    // Manipulate locators
    const affectedNumbers = await this.page.$$(
      '[data-testid="aggregates-affected-number"]',
    );
    const headerText = await this.aggregatesTitleHeader.textContent();
    const headerTextModified = headerText?.replace(/View0/, 'View 0');
    const layerCount = await this.aggregatesLayerRow.count();
    const iconLayerCount = await this.aggregatesInfoIcon.count();

    // Basic Assertions
    expect(headerTextModified).toBe('National View 0 Predicted Flood(s)');
    await expect(this.aggreagtesTitleInfoIcon).toBeVisible();
    expect(layerCount).toBe(5);
    expect(iconLayerCount).toBe(5);

    // Loop through the layers and check if they are present with correct data
    for (const affectedNumber of affectedNumbers) {
      const affectedNumberText = await affectedNumber.textContent();
      expect(affectedNumberText).toContain('0');
    }
    // Loop through the layers and check if they are present with correct names
    for (const layerName of expectedLayersNames) {
      const layerLocator = this.aggregatesLayerRow.locator(`text=${layerName}`);
      await expect(layerLocator).toBeVisible();
    }
  }

  async validatesAggregatesInfoButtons() {
    // click on the first info icon and validate the opopver content
    await this.aggreagtesTitleInfoIcon.click();
    const disclaimerText = await this.approximatedisclaimer.textContent();
    expect(disclaimerText).toContain(
      'All numbers are approximate and meant to be used as guidance.',
    );

    // wait for opover layer to be laoded and click to remove it
    await this.page.waitForTimeout(500);
    await this.popoverLayer.click();

    // click on the total exposed population info icon and validate the opopver content
    const exposedPopulationLayer = this.aggregatesLayerRow.filter({
      hasText: 'Exposed population',
    });
    await exposedPopulationLayer.getByTestId('aggregates-info-icon').click();
  }
}

export default AggregatesComponent;
