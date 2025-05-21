import { expect } from '@playwright/test';
import { Locator, Page } from 'playwright';
import { IbfStyles } from 'testData/styles.enum';
import { DisasterType, Layer } from 'testData/types';

import DashboardPage from './DashboardPage';

class AggregatesComponent extends DashboardPage {
  readonly page: Page;
  readonly aggregateSectionColumn: Locator;
  readonly aggregatesHeaderLabel: Locator;
  readonly aggregatesSubHeaderLabel: Locator;
  readonly aggreagtesHeaderInfoIcon: Locator;
  readonly aggregatesInfoIcon: Locator;
  readonly aggregatesLayerRow: Locator;
  readonly aggregatesAffectedNumber: Locator;
  readonly approximateDisclaimer: Locator;
  readonly popoverLayer: Locator;
  readonly layerInfoPopoverTitle: Locator;
  readonly layerInfoPopoverContent: Locator;
  readonly app: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.aggregateSectionColumn = this.page.getByTestId(
      'dashboard-aggregate-section',
    );
    this.aggregatesHeaderLabel = this.page.getByTestId(
      'aggregates-header-label',
    );
    this.aggregatesSubHeaderLabel = this.page.getByTestId(
      'aggregates-sub-header-label',
    );
    this.aggreagtesHeaderInfoIcon = this.page.getByTestId(
      'aggregates-header-info-icon',
    );
    this.aggregatesInfoIcon = this.page.getByTestId('aggregates-info-icon');
    this.aggregatesLayerRow = this.page.getByTestId('aggregates-row');
    this.aggregatesAffectedNumber = this.page.getByTestId(
      'aggregates-affected-number',
    );
    this.approximateDisclaimer = this.page.getByTestId(
      'disclaimer-approximate-message',
    );
    this.popoverLayer = this.page.getByTestId('disclaimer-popover-layer');
    this.layerInfoPopoverTitle = this.page.getByTestId('layer-info-title');
    this.layerInfoPopoverContent = this.page.getByTestId('layer-info-content');
    this.app = page.getByTestId('app');
  }

  async aggregateComponentIsVisible() {
    await expect(this.aggregateSectionColumn).toBeVisible();
    await expect(this.aggregateSectionColumn).toContainText('National View');
  }

  async aggregatesElementsDisplayedInNoTrigger(
    disasterType: DisasterType,
    layers: Layer[],
  ) {
    // Wait for the page to load
    await this.page.waitForSelector('[data-testid="loader"]', {
      state: 'hidden',
    });
    await this.page.waitForSelector('[data-testid="aggregates-row"]');

    // Manipulate locators
    const affectedNumbers = await this.page.$$(
      '[data-testid="aggregates-affected-number"]',
    );
    const headerText = await this.aggregatesHeaderLabel.textContent();
    const subHeaderText = await this.aggregatesSubHeaderLabel.textContent();
    const indicatorCount = await this.aggregatesLayerRow.count();
    const iconLayerCount = await this.aggregatesInfoIcon.count();

    const aggregates = layers.filter(({ aggregate }) => aggregate);

    // Basic Assertions
    expect(headerText).toBe('National View');
    expect(subHeaderText).toBe(`0 Predicted ${disasterType.label}(s)`);
    await expect(this.aggreagtesHeaderInfoIcon).toBeVisible();
    expect(indicatorCount).toBe(aggregates.length);
    expect(iconLayerCount).toBe(aggregates.length);

    // Loop through the layers and check if they are present with correct data
    // TODO: remove this filter after fixing AB#35929
    if (!['flash-floods', 'floods'].includes(disasterType.name)) {
      for (const affectedNumber of affectedNumbers) {
        const affectedNumberText = await affectedNumber.textContent();
        expect(affectedNumberText).toContain('0');
      }
    }
    // Loop through the layers and check if they are present with correct names
    for (const aggregate of aggregates) {
      const indicatorLocator = this.aggregatesLayerRow.locator(
        `text=${aggregate.label}`,
      );
      await expect(indicatorLocator).toBeVisible();
    }
  }

  async validatesAggregatesInfoButtons(layers: Layer[], disclaimer: string) {
    // click on the first info icon and validate the popover content
    await this.aggreagtesHeaderInfoIcon.click();
    const disclaimerText = await this.approximateDisclaimer.textContent();
    expect(disclaimerText).toContain(disclaimer);
    await this.page.locator('ion-backdrop').last().click();

    const aggregates = layers.filter(({ aggregate }) => aggregate);

    for (const { label, description } of aggregates) {
      // click on the total exposed population info icon and validate the popover content
      const aggregatesLayerRow = this.aggregatesLayerRow.filter({
        hasText: label,
      });
      await aggregatesLayerRow.getByTestId('aggregates-info-icon').click();
      const layerInfoTitle = await this.layerInfoPopoverTitle.textContent();
      const layerInfoContent = await this.layerInfoPopoverContent.textContent();
      expect(layerInfoTitle).toContain(label);
      expect(layerInfoContent).toContain(description); // REFACTOR: it may not be so relevant to test each individual description and get the test data exactly right for that
      await this.page.getByTestId('close-matrix-icon').click();
      await expect(this.layerInfoPopoverTitle).toBeHidden();
    }
  }

  async getEventCount() {
    const aggregatesHeaderLabel =
      await this.aggregatesSubHeaderLabel.textContent();
    const eventCount = aggregatesHeaderLabel?.match(/\d+/g);

    return eventCount ? parseInt(eventCount[0], 10) : null;
  }

  async validateColorOfAggregatesHeaderByClass({
    isTrigger = false,
  }: {
    isTrigger?: boolean;
  }) {
    const actionHeaderText = this.app;
    const headerColour = await actionHeaderText.getAttribute('class');

    if (isTrigger) {
      expect(headerColour).toContain(IbfStyles.trigger);
    } else {
      expect(headerColour).toContain(IbfStyles.noTrigger);
    }
  }
}

export default AggregatesComponent;
