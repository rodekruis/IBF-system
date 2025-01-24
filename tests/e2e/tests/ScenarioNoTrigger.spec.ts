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

import { getAccessToken, mockData, resetDB } from '../helpers/utility.helper';
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
  const disasterType = NoTriggerDataSet.DisasterType;
  const countryCodeISO3 = NoTriggerDataSet.CountryCode;
  const scenario = NoTriggerDataSet.NoTriggerScenario;
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

    // Reset the database
    accessToken = await getAccessToken();
    await resetDB(accessToken);

    // Load a mock scenario
    await mockData(disasterType, scenario, countryCodeISO3, accessToken, date);

    await page.goto('/');
    // Login into the portal
    await pages.login.login(
      NoTriggerDataSet.UserMail,
      NoTriggerDataSet.UserPassword,
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('DashboardPage', () => {
    DashboardPageVisible(pages, components, disasterType, date);
  });

  test.describe('MapComponent', () => {
    MapComponentVisible(pages, components, disasterType);
    MapComponentInteractive(pages, components, disasterType);
    MapComponentLayersVisible(pages, components, disasterType);
    MapComponentAlertThreshold(pages, components, disasterType);
    MapComponentGloFASStations(pages, components, disasterType);
    MapComponentGloFASStationsWarning(pages, components, disasterType);
  });

  test.describe('AggregatesComponent', () => {
    AggregatesComponentVisible(pages, components, disasterType);
    AggregateComponentTitleHover(pages, components, disasterType);
    AggregateComponentButtonClick(pages, components, disasterType);
  });

  test.describe('ChatComponent', () => {
    ChatComponentVisible(pages, components, disasterType, date);
    ChatComponentButtonClick(pages, components, disasterType);
  });

  test.describe('DisasterTypeComponent', () => {
    DisasterTypeComponentVisible(pages, components, disasterType);
    DisasterTypeComponentSelect(pages, components);
  });

  test.describe('TimelineComponent', () => {
    TimelineComponentVisible(pages, components, disasterType);
    TimelineComponentDisabled(pages, components, disasterType);
  });

  // Do this last, as it logs out the user
  test.describe('UserStateComponent', () => {
    UserStateComponentVisible(pages, components, disasterType);
    UserStateComponentLogout(pages, components, disasterType);
  });
});
