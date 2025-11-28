import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';

export default () => {
  test('[33057] should open popover on info icon click', async ({ page }) => {
    const chat = new ChatComponent(page);

    await chat.validateEventsInfoButtonsAreClickable();
  });
};
