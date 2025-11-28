import test, { expect } from '@playwright/test';

export default () => {
  test('redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL('/');
    expect(page.url()).not.toContain('login');
  });
};
