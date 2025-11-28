import test from '@playwright/test';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { Dataset } from 'testData/types';

export default (dataset: Dataset, date: Date) => {
  test('[33012] should be visible', async ({ page }) => {
    const userState = new UserStateComponent(page);
    const disasterType = new DisasterTypeComponent(page);
    const chat = new ChatComponent(page);
    const aggregates = new AggregatesComponent(page);
    const map = new MapComponent(page);

    await userState.headerComponentIsVisible(dataset);
    await disasterType.topBarComponentIsVisible();
    await chat.chatColumnIsVisible({ date, scenario: dataset.scenario });
    await aggregates.aggregateComponentIsVisible();
    await map.mapComponentIsVisible();
  });
};
