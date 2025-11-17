import test from '@playwright/test';
import ChatComponent from 'Pages/ChatComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset, date: Date) => {
  test('[33053] should be visible', async ({ page }) => {
    const chat = new ChatComponent(page);

    await chat.chatColumnIsVisible({ date, scenario: dataset.scenario });
    await chat.allDefaultButtonsArePresent();
  });
};
