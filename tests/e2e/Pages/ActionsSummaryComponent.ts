import { Locator, Page } from 'playwright';

import DashboardPage from './DashboardPage';

class ActionsSummaryComponent extends DashboardPage {
  readonly page: Page;
  readonly tooltipButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.tooltipButton = this.page.getByTestId('action-summary-info');
  }

  async actionsSummaryIsVisible() {
    console.log('aggregateComponentIsVisible');
  }

  async validateActionsSummaryInfoButtons() {
    const counttoolTipInfoButton = await this.tooltipButton.count();

    for (let i = 0; i < counttoolTipInfoButton; i++) {
      const toolTipInfoButton = this.tooltipButton.nth(i);
      await toolTipInfoButton.click();
      // await this.validatePopOverText({ text: eventTooltipContent });
      await this.page.getByTestId('close-matrix-icon').click();
    }
  }
}

export default ActionsSummaryComponent;
