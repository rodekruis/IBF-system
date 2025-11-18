import test from '@playwright/test';
import ManagePage from 'Pages/ManagePage';

export default () => {
  test('should be visible', async ({ page }) => {
    const managePage = new ManagePage(page);

    await page.goto('/manage');

    await managePage.isVisible(true);
  });
};
