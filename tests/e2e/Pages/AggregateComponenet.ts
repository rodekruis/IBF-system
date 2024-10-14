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
  readonly aggregatesMainInfoIcon: Locator;
  readonly aggregatesInfoIcon: Locator;
  readonly aggregatesLayerRow: Locator;
  readonly aggregatesAffectedNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.aggregateSectionColumn = this.page.getByTestId(
      'dashboard-aggregate-section',
    );
    this.aggregatesTitleHeader = this.page.getByTestId('action-title');
    this.aggregatesMainInfoIcon = this.page.getByTestId(
      'aggregates-main-info-icon',
    );
    this.aggregatesInfoIcon = this.page.getByTestId('aggregates-info-icon');
    this.aggregatesLayerRow = this.page.getByTestId('aggregates-row');
    this.aggregatesAffectedNumber = this.page.getByTestId(
      'aggregates-affected-number',
    );
  }

  async aggregateComponentIsVisible() {
    await expect(this.aggregateSectionColumn).toBeVisible();
    await expect(this.aggregateSectionColumn).toContainText('National View');
  }

  async aggregatesAlementsDisplayedInNoTrigger() {
    // Wait for the page to load
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
    await expect(this.aggregatesMainInfoIcon).toBeVisible();
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
}

export default AggregatesComponent;
