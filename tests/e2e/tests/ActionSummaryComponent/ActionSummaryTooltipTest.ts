import test from '@playwright/test';
import ActionsSummaryComponent from 'Pages/ActionSummaryComponent';

export default () => {
  test('[33067] should open popover', async ({ page }) => {
    const actionsSummary = new ActionsSummaryComponent(page);

    await actionsSummary.validateActionsSummaryInfoButtons();
  });
};
