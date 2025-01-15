import { Page, test } from '@playwright/test';
import { Components, Pages } from 'helpers/interfaces';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
import TimelineComponent from 'Pages/TimelineComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { NoTriggerDataSet } from 'testData/testData.enum';

import { getAccessToken, mockFloods, resetDB } from '../helpers/utility.helper';
import LoginPage from '../Pages/LoginPage';
import AggregateComponentButtonClick from './AggregatesComponent/AggregateComponentButtonClick';
import AggregateComponentTitleHover from './AggregatesComponent/AggregateComponentTitleHover';
import AggregatesComponentVisible from './AggregatesComponent/AggregatesComponentVisible';
import ChatComponentButtonClick from './ChatComponent/ChatComponentButtonClick';
import ChatComponentVisible from './ChatComponent/ChatComponentVisible';
import DashboardPageVisible from './DashboardPage/DashboardPageVisible';
import DisasterTypeComponentSelect from './DisasterTypeComponent/DisasterTypeComponentSelect';
import DisasterTypeComponentVisible from './DisasterTypeComponent/DisasterTypeComponentVisible';
import MapComponentAlertThreshold from './MapComponent/MapComponentAlertThreshold';
import MapComponentGloFASStations from './MapComponent/MapComponentGloFASStations';
import MapComponentGloFASStationsWarning from './MapComponent/MapComponentGloFASStationsWarning';
import MapComponentInteractive from './MapComponent/MapComponentInteractive';
import MapComponentLayersVisible from './MapComponent/MapComponentLayersVisible';
import MapComponentVisible from './MapComponent/MapComponentVisible';
import TimelineComponentDisabled from './TimelineComponent/TimelineComponentDisabled';
import TimelineComponentVisible from './TimelineComponent/TimelineComponentVisible';
import UserStateComponentLogout from './UserStateComponent/UserStateComponentLogout';
import UserStateComponentVisible from './UserStateComponent/UserStateComponentVisible';

let accessToken: string;
let page: Page;
// Declare pages and components
const pages: Partial<Pages> = {};
const components: Partial<Components> = {};

test.describe('Scenario: No Trigger', () => {
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
      NoTriggerDataSet.NoTriggerScenario,
      NoTriggerDataSet.CountryCode,
      accessToken,
    );

    await page.goto('/');
    // Login into the portal
    await pages.login.login(
      NoTriggerDataSet.UserMail,
      NoTriggerDataSet.UserPassword,
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.reload();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('DashboardPage', () => {
    DashboardPageVisible(pages, components);
  });

  test.describe('MapComponent', () => {
    MapComponentVisible(pages, components);
    MapComponentInteractive(pages, components);
    MapComponentLayersVisible(pages, components);
    MapComponentAlertThreshold(pages, components);
    MapComponentGloFASStations(pages, components);
    MapComponentGloFASStationsWarning(pages, components);
  });

  test.describe('UserStateComponent', () => {
    UserStateComponentVisible(pages, components);
    UserStateComponentLogout(pages, components);
  });

  test.describe('AggregatesComponent', () => {
    AggregatesComponentVisible(pages, components);
    AggregateComponentTitleHover(pages, components);
    AggregateComponentButtonClick(pages, components);
  });

  test.describe('ChatComponent', () => {
    ChatComponentVisible(pages, components);
    ChatComponentButtonClick(pages, components);
  });

  test.describe('DisasterTypeComponent', () => {
    DisasterTypeComponentVisible(pages, components);
    DisasterTypeComponentSelect(pages, components);
  });

  test.describe('TimelineComponent', () => {
    TimelineComponentVisible(pages, components);
    TimelineComponentDisabled(pages, components);
  });
});
