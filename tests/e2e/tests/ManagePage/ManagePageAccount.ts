import test from '@playwright/test';
import ManageAccountComponent from 'Pages/ManageAccountComponent';

export default () => {
  test('should show account form', async ({ page }) => {
    const manageAccountComponent = new ManageAccountComponent(page);

    await page.goto('/manage/account');

    await manageAccountComponent.isVisible();
  });
};
