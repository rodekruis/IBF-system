import { Page, test } from '@playwright/test';
import { Components, Pages } from 'helpers/interfaces';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
import TimelineComponent from 'Pages/TimelineComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { TriggerDataSet } from 'testData/testData.enum';

import { getAccessToken, mockFloods, resetDB } from '../helpers/utility.helper';
import LoginPage from '../Pages/LoginPage';
import AggregateComponentEventCount from './AggregatesComponent/AggregateComponentEventCount';
import AggregateComponentHeaderColour from './AggregatesComponent/AggregateComponentHeaderColour';
import ChatComponentEventClick from './ChatComponent/ChatComponentEventClick';
import ChatComponentEventCount from './ChatComponent/ChatComponentEventCount';
import ChatComponentInfoPopover from './ChatComponent/ChatComponentInfoPopover';
import MapComponentFloodExtent from './MapComponent/MapComponentFloodExtent';
import MapComponentGloFASStationsTrigger from './MapComponent/MapComponentGloFASStationsTrigger';
import MapComponentLayersDefault from './MapComponent/MapComponentLayersDefault';

let accessToken: string;
let page: Page;
// Declare pages and components
const pages: Partial<Pages> = {};
const components: Partial<Components> = {};

test.describe('Scenario: Trigger', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    // Initialize pages and components after sharedPage is assigned
    pages.login = new LoginPage(page);
    pages.dashboard = new DashboardPage(page);
    components.map = new MapComponent(page);
    components.userState = new UserStateComponent(page);
    components.aggregates = new AggregatesComponent(page);
    components.chat = new ChatComponent(page);
    components.disasterType = new DisasterTypeComponent(page);
    components.timeline = new TimelineComponent(page);

    // Reset the database
    accessToken = await getAccessToken();
    await resetDB(accessToken);

    // Load a mock scenario
    // We should maybe create one mock for all different disaster types for now we can just use floods
    await mockFloods(
      TriggerDataSet.TriggerScenario,
      TriggerDataSet.CountryCode,
      accessToken,
    );

    await page.goto('/');
    // Login into the portal
    await pages.login.login(
      TriggerDataSet.UserMail,
      TriggerDataSet.UserPassword,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('MapComponent', () => {
    MapComponentLayersDefault(pages, components);
    MapComponentFloodExtent(pages, components);
    MapComponentGloFASStationsTrigger(pages, components);
  });

  test.describe('AggregatesComponent', () => {
    AggregateComponentEventCount(pages, components);
    AggregateComponentHeaderColour(pages, components);
  });

  test.describe('ChatComponent', () => {
    ChatComponentEventClick(pages, components);
    ChatComponentEventCount(pages, components);
    ChatComponentInfoPopover(pages, components);
  });
});
