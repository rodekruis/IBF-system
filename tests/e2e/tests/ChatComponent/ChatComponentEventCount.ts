import test, { expect } from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';

export default () => {
  test('[33056] should match the number of events in aggregates', async ({
    page,
  }) => {
    const chat = new ChatComponent(page);
    const aggregates = new AggregatesComponent(page);

    await chat.allDefaultButtonsArePresent();

    // get the number of warning events and aggregated events
    const chatEventCount = await chat.getEventCount();
    const aggregatesEventCount = await aggregates.getEventCount();

    // check if the number of warning events is equal to the number of aggregated events
    expect(chatEventCount).toEqual(aggregatesEventCount);
  });
};
