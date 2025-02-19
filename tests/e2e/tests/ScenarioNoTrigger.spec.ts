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
import DashboardPageVisible from './DashboardPage/DashboardPageVisible';
import MapComponentGloFASStations from './MapComponent/MapComponentGloFASStations';
import MapComponentVisible from './MapComponent/MapComponentVisible';

let accessToken: string;
let page: Page;
// Declare pages and components
const pages: Partial<Pages> = {};
const components: Partial<Components> = {};

// ##TODO: move this somewhere else
export enum DisasterTypeEnum {
  Floods = 'floods',
  Drought = 'drought',
}

test.describe.only('Scenario: No Trigger', () => {
  const disasterTypes = [DisasterTypeEnum.Floods, DisasterTypeEnum.Drought];
  const countryCodeISO3 = NoTriggerDataSet.CountryCode;
  const scenario = NoTriggerDataSet.NoTriggerScenario;

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
    for (const disasterType of disasterTypes) {
      const date = new Date();
      await mockData(
        disasterType,
        scenario,
        countryCodeISO3,
        accessToken,
        date,
      );
    }

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

  for (const disasterType of disasterTypes) {
    test.describe('DashboardPage', () => {
      DashboardPageVisible(pages, components, disasterType);
    });
    test.describe('MapComponent', () => {
      MapComponentVisible(pages, components, disasterType);
      // MapComponentInteractive(pages, components, disasterType);
      //   MapComponentLayersVisible(pages, components, disasterType);
      //   MapComponentAlertThreshold(pages, components, disasterType);
      MapComponentGloFASStations(pages, components, disasterType);
      //   MapComponentGloFASStationsWarning(pages, components, disasterType);
    });
    // test.describe('AggregatesComponent', () => {
    //   AggregatesComponentVisible(pages, components, disasterType);
    //   AggregateComponentTitleHover(pages, components, disasterType);
    //   AggregateComponentButtonClick(pages, components, disasterType);
    // });
    // test.describe('ChatComponent', () => {
    //   ChatComponentVisible(pages, components, disasterType);
    //   ChatComponentButtonClick(pages, components, disasterType);
    // });
    // test.describe('DisasterTypeComponent', () => {
    //   DisasterTypeComponentVisible(pages, components, disasterType);
    //   DisasterTypeComponentSelect(pages, components);
    // });
    // test.describe('TimelineComponent', () => {
    //   TimelineComponentVisible(pages, components, disasterType);
    //   TimelineComponentDisabled(pages, components, disasterType);
    // });
    // // Do this last, as it logs out the user
    // test.describe('UserStateComponent', () => {
    //   UserStateComponentVisible(pages, components, disasterType);
    //   UserStateComponentLogout(pages, components, disasterType);
    // });
  }
});
