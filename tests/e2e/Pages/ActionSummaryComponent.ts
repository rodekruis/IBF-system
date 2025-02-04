import { Locator, Page } from 'playwright';

import { AREAS_OF_FOCUS } from '../../../interfaces/IBF-dashboard/src/app/models/area-of-focus.const';
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
      const descriptionText = AREAS_OF_FOCUS[i].description?.replace(
        /<br>|<ul>|<li>|<strong>|<\/ul>|<\/li>|<\/strong>/g,
        '',
      );

      await toolTipInfoButton.click();
      await this.page.waitForTimeout(200);
      await this.validateLabel({ text: AREAS_OF_FOCUS[i].label });
      await this.validateDescription({ text: descriptionText });
      await this.page.getByTestId('close-matrix-icon').click();
    }
  }
}

export default ActionsSummaryComponent;
