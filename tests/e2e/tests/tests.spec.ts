import { Page, test } from '@playwright/test';
import { Components, Pages } from 'helpers/interfaces';
import AggregatesComponent from 'Pages/AggregatesComponent';
import ChatComponent from 'Pages/ChatComponent';
import DashboardPage from 'Pages/DashboardPage';
import DisasterTypeComponent from 'Pages/DisasterTypeComponent';
import MapComponent from 'Pages/MapComponent';
import TimelineComponent from 'Pages/TimelineComponent';
import UserStateComponent from 'Pages/UserStateComponent';
import { Dataset } from 'testData/types';
import UgandaDroughtWarning from 'testData/UgandaDroughtWarning.json';
import UgandaFloodsNoTrigger from 'testData/UgandaFloodsNoTrigger.json';
import UgandaFloodsTrigger from 'testData/UgandaFloodsTrigger.json';

import { getAccessToken, mockData, resetDB } from '../helpers/utility.helper';
import ActionsSummaryComponent from '../Pages/ActionSummaryComponent';
import LoginPage from '../Pages/LoginPage';
import ActionSummaryTooltipTest from './ActionSummaryComponent/ActionSummaryTooltipTest';
import AggregateComponentButtonClick from './AggregatesComponent/AggregateComponentButtonClick';
import AggregateComponentEventCount from './AggregatesComponent/AggregateComponentEventCount';
import AggregateComponentHeaderColour from './AggregatesComponent/AggregateComponentHeaderColour';
import AggregateComponentTitleHover from './AggregatesComponent/AggregateComponentTitleHover';
import AggregatesComponentVisible from './AggregatesComponent/AggregatesComponentVisible';
import ChatComponentButtonClick from './ChatComponent/ChatComponentButtonClick';
import ChatComponentEventClick from './ChatComponent/ChatComponentEventClick';
import ChatComponentEventCount from './ChatComponent/ChatComponentEventCount';
import ChatComponentInfoPopover from './ChatComponent/ChatComponentInfoPopover';
import ChatComponentTriggeredAreasList from './ChatComponent/ChatComponentTriggeredAreasList';
import ChatComponentVisible from './ChatComponent/ChatComponentVisible';
import DashboardPageVisible from './DashboardPage/DashboardPageVisible';
import DisasterTypeComponentSelect from './DisasterTypeComponent/DisasterTypeComponentSelect';
import DisasterTypeComponentVisible from './DisasterTypeComponent/DisasterTypeComponentVisible';
import MapComponentFloodExtent from './MapComponent/MapComponentFloodExtent';
import MapComponentGloFASStations from './MapComponent/MapComponentGloFASStations';
import MapComponentGloFASStationsTrigger from './MapComponent/MapComponentGloFASStationsTrigger';
import MapComponentGloFASStationsWarning from './MapComponent/MapComponentGloFASStationsWarning';
import MapComponentInfoPopover from './MapComponent/MapComponentInfoPopover';
import MapComponentInteractive from './MapComponent/MapComponentInteractive';
import MapComponentLayersDefault from './MapComponent/MapComponentLayersDefault';
import MapComponentLayersVisible from './MapComponent/MapComponentLayersVisible';
import MapComponentTriggerLayer from './MapComponent/MapComponentTriggerLayer';
import MapComponentVisible from './MapComponent/MapComponentVisible';
import TimelineComponentNotClickable from './TimelineComponent/TimelineComponentNotClickable';
import TimelineComponentVisible from './TimelineComponent/TimelineComponentVisible';
import UserStateComponentLogout from './UserStateComponent/UserStateComponentLogout';
import UserStateComponentVisible from './UserStateComponent/UserStateComponentVisible';

test.describe('E2E Tests', () => {
  let accessToken: string;
  test.beforeAll(async () => {
    // Reset the database only once
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  // Run tests for each dataset
  const datasets: Dataset[] = [
    UgandaFloodsNoTrigger,
    UgandaFloodsTrigger,
    // UgandaDroughtNoTrigger, // Disable until deemed valuable, as it is very similar to floods no-trigger
    UgandaDroughtWarning,
  ];

  datasets.forEach((dataset) => {
    const {
      country: { code },
      disasterType,
      scenario,
      user: { email, password },
    } = dataset;

    let page: Page;

    const pages: Partial<Pages> = {};
    const components: Partial<Components> = {};

    test.describe(`Dataset ${dataset.configurationId}: ${email} ${code} ${disasterType.name} ${scenario}`, () => {
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

        // Load a mock scenario
        await mockData(disasterType.name, scenario, code, accessToken, date);

        await page.goto('/');
        // Login into the portal
        await pages.login.login(email, password);
      });

      test.beforeEach(async ({ page }) => {
        await page.goto('/');
      });

      test.afterAll(async () => {
        await page.close();
      });

      test.describe('DashboardPage', () => {
        DashboardPageVisible(pages, components, dataset, date);
      });

      test.describe('MapComponent', () => {
        MapComponentVisible(pages, components, dataset);
        MapComponentInteractive(pages, components, dataset);
        MapComponentInfoPopover(pages, components, dataset);
        MapComponentLayersVisible(pages, components, dataset);
        MapComponentTriggerLayer(pages, components, dataset);
        MapComponentGloFASStations(pages, components, dataset);

        if (scenario !== 'no-trigger') {
          // REFACTOR
          MapComponentLayersDefault(pages, components, dataset);
          MapComponentFloodExtent(pages, components, dataset);
          MapComponentGloFASStationsTrigger(pages, components, dataset);
        } else {
          // REFACTOR
          MapComponentGloFASStationsWarning(pages, components, dataset);
        }
      });

      test.describe('AggregatesComponent', () => {
        AggregatesComponentVisible(pages, components, dataset);
        AggregateComponentTitleHover(pages, components, dataset);
        AggregateComponentButtonClick(pages, components, dataset);

        if (scenario !== 'no-trigger') {
          // REFACTOR
          AggregateComponentEventCount(pages, components, dataset);
          AggregateComponentHeaderColour(pages, components, dataset);
        }
      });

      test.describe('ChatComponent', () => {
        ChatComponentVisible(pages, components, dataset, date);
        ChatComponentButtonClick(pages, components, dataset);

        if (scenario !== 'no-trigger') {
          // REFACTOR
          ChatComponentTriggeredAreasList(pages, components, dataset, date);
          ChatComponentEventClick(pages, components, dataset, date);
          ChatComponentEventCount(pages, components, dataset, date);
          ChatComponentInfoPopover(pages, components, dataset, date);
        }
      });

      test.describe('DisasterTypeComponent', () => {
        DisasterTypeComponentVisible(pages, components, dataset);
        DisasterTypeComponentSelect(pages, components, dataset);
      });

      test.describe('TimelineComponent', () => {
        TimelineComponentVisible(pages, components, dataset);

        if (scenario !== 'no-trigger') {
          // REFACTOR
          TimelineComponentNotClickable(pages, components, dataset);
        }
      });

      test.describe('ActionSummaryComponent', () => {
        if (scenario === 'trigger') {
          // REFACTOR
          ActionSummaryTooltipTest(pages, components, dataset);
        }
      });

      // Do this last, as it logs out the user
      test.describe('UserStateComponent', () => {
        UserStateComponentVisible(pages, components, dataset);
        UserStateComponentLogout(pages, components, dataset);
      });
    });
  });
});
