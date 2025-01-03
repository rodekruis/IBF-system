import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';
import { IbfStyles } from 'testData/styles.enum';
import { EnglishTranslations } from 'testData/translations.enum';

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
  readonly approximateDisclaimer: Locator;
  readonly popoverLayer: Locator;
  readonly layerInfoPopoverTitle: Locator;
  readonly layerInfoPopoverContent: Locator;
  readonly ibfDashboardInterface: Locator;

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
    this.approximateDisclaimer = this.page.getByTestId(
      'disclaimer-approximate-message',
    );
    this.popoverLayer = this.page.getByTestId('disclaimer-popover-layer');
    this.layerInfoPopoverTitle = this.page.getByTestId('layer-info-title');
    this.layerInfoPopoverContent = this.page.getByTestId('layer-info-content');
    this.ibfDashboardInterface = page.getByTestId('ibf-dashboard-interface');
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
    const disclaimerText = await this.approximateDisclaimer.textContent();
    expect(disclaimerText).toContain(
      EnglishTranslations.ApproximateNumberDisclaimer,
    );

    // wait for opover layer to be laoded and click to remove it
    await this.page.waitForTimeout(500);
    await this.popoverLayer.click();

    // click on the total exposed population info icon and validate the opopver content
    const exposedPopulationLayer = this.aggregatesLayerRow.filter({
      hasText: 'Exposed population',
    });
    await exposedPopulationLayer.getByTestId('aggregates-info-icon').click();
    const layerInfoTitle = await this.layerInfoPopoverTitle.textContent();
    const layerInfoContent = await this.layerInfoPopoverContent.textContent();
    expect(layerInfoTitle).toContain('Exposed population');
    expect(layerInfoContent).toContain(
      EnglishTranslations.ExposedPopulationInfoButtonDisclaimer,
    );
  }

  async validateLayerPopoverExternalLink() {
    // Define link to click
    const layerPopoverExternalLink = this.layerInfoPopoverContent.filter({
      hasText: 'High Resolution Settlement Layer (HRSL)',
    });

    await layerPopoverExternalLink.click();
    expect(this.page.url()).toContain(
      'https://www.ciesin.columbia.edu/data/hrsl/',
    );
  }

  async getNumberOfPredictedEvents() {
    const actionHeaderText = await this.aggregatesTitleHeader.textContent();
    const eventsNumber = actionHeaderText?.match(/\d+/g);

    return eventsNumber ? parseInt(eventsNumber[0], 10) : null;
  }

  async validateColorOfAggregatesHeaderByClass({
    isTrigger = false,
  }: {
    isTrigger?: boolean;
  }) {
    const actionHeaderText = this.ibfDashboardInterface;
    const headerColour = await actionHeaderText.getAttribute('class');

    if (isTrigger) {
      expect(headerColour).toContain(IbfStyles.trigger);
    } else {
      expect(headerColour).toContain(IbfStyles.noTrigger);
    }
  }
}

export default AggregatesComponent;
