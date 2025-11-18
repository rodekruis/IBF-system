import test, { expect } from '@playwright/test';
import ManagePage from 'Pages/ManagePage';

export default () => {
  test('redirects to manage', async ({ page }) => {
    const managePage = new ManagePage(page);

    await page.goto('/manage/users');
    await page.waitForURL('/manage/account');

    expect(page.url()).not.toContain('users');
    await managePage.isVisible();
  });
};
