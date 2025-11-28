import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';

export default () => {
  test('[33055] should show clickable prediction button', async ({ page }) => {
    const chat = new ChatComponent(page);

    await chat.allDefaultButtonsArePresent();
    await chat.predictionButtonsAreActive();
  });
};
