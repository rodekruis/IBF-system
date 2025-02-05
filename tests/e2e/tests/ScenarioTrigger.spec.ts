import { Page, test } from '@playwright/test';
import { Components, Pages } from 'helpers/interfaces';
import ActionsSummaryComponent from 'Pages/ActionSummaryComponent';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
import TimelineComponent from 'Pages/TimelineComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { TriggerDataSet } from 'testData/testData.enum';

import { getAccessToken, mockData, resetDB } from '../helpers/utility.helper';
import LoginPage from '../Pages/LoginPage';
import ActionSummaryTooltipTest from './ActionSummaryComponent/ActionSummaryTooltipTest';
import AggregateComponentEventCount from './AggregatesComponent/AggregateComponentEventCount';
import AggregateComponentHeaderColour from './AggregatesComponent/AggregateComponentHeaderColour';
import ChatComponentEventClick from './ChatComponent/ChatComponentEventClick';
import ChatComponentEventCount from './ChatComponent/ChatComponentEventCount';
import ChatComponentInfoPopover from './ChatComponent/ChatComponentInfoPopover';
import MapComponentFloodExtent from './MapComponent/MapComponentFloodExtent';
import MapComponentGloFASStationsTrigger from './MapComponent/MapComponentGloFASStationsTrigger';
import MapComponentLayersDefault from './MapComponent/MapComponentLayersDefault';
import TimelineComponentNotClickable from './TimelineComponent/TimelineComponentNotClickable';

let accessToken: string;
let page: Page;
// Declare pages and components
const pages: Partial<Pages> = {};
const components: Partial<Components> = {};

test.describe('Scenario: Trigger', () => {
  const disasterType = TriggerDataSet.DisasterType;
  const countryCodeISO3 = TriggerDataSet.CountryCode;
  const scenario = TriggerDataSet.TriggerScenario;
  const date = new Date();

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
    components.actionsSummary = new ActionsSummaryComponent(page);

    // Reset the database
    accessToken = await getAccessToken();
    await resetDB(accessToken);

    // Load a mock scenario
    await mockData(disasterType, scenario, countryCodeISO3, accessToken, date);

    await page.goto('/');
    // Login into the portal
    await pages.login.login(
      TriggerDataSet.UserMail,
      TriggerDataSet.UserPassword,
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('MapComponent', () => {
    MapComponentLayersDefault(pages, components, disasterType);
    MapComponentFloodExtent(pages, components, disasterType);
    MapComponentGloFASStationsTrigger(pages, components, disasterType);
  });

  test.describe('AggregatesComponent', () => {
    AggregateComponentEventCount(pages, components, disasterType);
    AggregateComponentHeaderColour(pages, components, disasterType);
  });

  test.describe('ChatComponent', () => {
    ChatComponentEventClick(pages, components, disasterType, date);
    ChatComponentEventCount(pages, components, disasterType, date);
    ChatComponentInfoPopover(pages, components, disasterType, date);
  });

  test.describe('TimelineComponent', () => {
    TimelineComponentNotClickable(pages, components, disasterType);
  });

  test.describe('ActionsSummaryComponent', () => {
    ActionSummaryTooltipTest(pages, components, disasterType);
  });
});
