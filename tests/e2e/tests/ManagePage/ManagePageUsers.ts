import test from '@playwright/test';
import ManageUsersComponent from 'Pages/ManageUsersComponent';

export default () => {
  test('should show users table', async ({ page }) => {
    const manageUsersComponent = new ManageUsersComponent(page);

    await page.goto('/manage/users');

    await manageUsersComponent.isVisible();
  });
};
