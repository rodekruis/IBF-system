import test from '@playwright/test';
import ManageAccountComponent from 'Pages/ManageAccountComponent';

export default () => {
  test('should update user account', async ({ page }) => {
    const manageAccountComponent = new ManageAccountComponent(page);

    await page.goto('/manage/account');

    await manageAccountComponent.save();
  });
};
