import test from '@playwright/test';
import ManagePreferencesComponent from 'Pages/ManagePreferencesComponent';

export default () => {
  test('should update preferences', async ({ page }) => {
    const managePreferencesComponent = new ManagePreferencesComponent(page);

    await page.goto('/manage/preferences');

    await managePreferencesComponent.toggle();
  });
};
