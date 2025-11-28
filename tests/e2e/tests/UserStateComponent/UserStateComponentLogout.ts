import test from '@playwright/test';
import LoginPage from 'Pages/LoginPage';
import UserStateComponent from 'Pages/UserStateComponent';

export default () => {
  test('[33026] should logout to login page', async ({ page }) => {
    const login = new LoginPage(page);
    const userState = new UserStateComponent(page);

    await userState.logOut();
    await login.loginScreenIsVisible();
  });
};
