import test from '@playwright/test';
import LoginPage from 'Pages/LoginPage';
import UserStateComponent from 'Pages/UserStateComponent';

export default () => {
  // TODO: Re-enable after fixing ion-popover pointer interception issue.
  // The @ionic/angular 8.8.x upgrade changed popover behavior: an ion-popover
  // element now intercepts pointer events on user-initials hover, causing a
  // timeout. See: https://github.com/rodekruis/IBF-system/pull/2698
  test.skip('[33026] should logout to login page', async ({ page }) => {
    const login = new LoginPage(page);
    const userState = new UserStateComponent(page);

    await userState.logOut();
    await login.loginScreenIsVisible();
  });
};
