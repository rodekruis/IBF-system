import { test } from '@playwright/test';
import DashboardPage from 'Pages/DashboardPage';
import MalawiFlashFloodsTrigger from 'testData/MalawiFlashFloodsTrigger.json';
import { Dataset } from 'testData/types';
import UgandaDroughtWarning from 'testData/UgandaDroughtWarning.json';
import UgandaFloodsNoTrigger from 'testData/UgandaFloodsNoTrigger.json';
import UgandaFloodsTrigger from 'testData/UgandaFloodsTrigger.json';

import { getToken, mock, registerUser, reset } from '../helpers/utility.helper';
import LoginPage from '../Pages/LoginPage';
import ActionSummaryTooltipTest from './ActionSummaryComponent/ActionSummaryTooltipTest';
import AggregateComponentButtonClick from './AggregatesComponent/AggregateComponentButtonClick';
import AggregateComponentEventCount from './AggregatesComponent/AggregateComponentEventCount';
import AggregateComponentHeaderColour from './AggregatesComponent/AggregateComponentHeaderColour';
import AggregateComponentTitleHover from './AggregatesComponent/AggregateComponentTitleHover';
import AggregatesComponentVisible from './AggregatesComponent/AggregatesComponentVisible';
import ChatComponentAlertAreasList from './ChatComponent/ChatComponentAlertAreasList';
import ChatComponentButtonClick from './ChatComponent/ChatComponentButtonClick';
import ChatComponentEventClick from './ChatComponent/ChatComponentEventClick';
import ChatComponentEventCount from './ChatComponent/ChatComponentEventCount';
import ChatComponentInfoPopover from './ChatComponent/ChatComponentInfoPopover';
import ChatComponentSetTrigger from './ChatComponent/ChatComponentSetTrigger';
import ChatComponentVisible from './ChatComponent/ChatComponentVisible';
import DashboardPageVisible from './DashboardPage/DashboardPageVisible';
import DisasterTypeComponentSelect from './DisasterTypeComponent/DisasterTypeComponentSelect';
import DisasterTypeComponentVisible from './DisasterTypeComponent/DisasterTypeComponentVisible';
import MapComponentInfoPopover from './MapComponent/MapComponentInfoPopover';
import MapComponentInteractive from './MapComponent/MapComponentInteractive';
import MapComponentLayersVisible from './MapComponent/MapComponentLayersVisible';
import MapComponentLinesLayers from './MapComponent/MapComponentLinesLayers';
import MapComponentVisible from './MapComponent/MapComponentVisible';
import TimelineComponentNotClickable from './TimelineComponent/TimelineComponentNotClickable';
import TimelineComponentVisible from './TimelineComponent/TimelineComponentVisible';
import UserStateComponentLogout from './UserStateComponent/UserStateComponentLogout';
import UserStateComponentVisible from './UserStateComponent/UserStateComponentVisible';

test.describe('e2e tests', () => {
  test.beforeAll(async () => {
    await reset();
  });

  // Run tests for each dataset
  const datasets: Dataset[] = [
    UgandaFloodsNoTrigger,
    UgandaFloodsTrigger,
    // UgandaDroughtNoTrigger, // Disable until deemed valuable, as it is very similar to floods no-trigger
    UgandaDroughtWarning,
    // MalawiFlashFloodsNoTrigger, // Disable until deemed valuable, as it is very similar to floods no-trigger
    MalawiFlashFloodsTrigger,
  ];

  datasets.forEach((dataset) => {
    const {
      country: { code },
      disasterType,
      scenario,
      user: { email },
    } = dataset;

    test.describe(`Dataset ${dataset.configurationId}: ${email} ${code} ${disasterType.name} ${scenario}`, () => {
      const date = new Date();

      test.beforeAll(async ({}) => {
        // Load a mock scenario
        const token = await getToken();
        await mock(token, disasterType.name, scenario, code, date);

        // create user with appropriate access
        await registerUser(token, dataset.user, code, disasterType.name);
      });

      test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        if (page.url().includes('login')) {
          const login = new LoginPage(page);
          await login.login(email);
        }

        const dashboard = new DashboardPage(page);
        await dashboard.navigateToDisasterType(dataset.disasterType.name);
      });

      test.describe('DashboardPage', () => {
        DashboardPageVisible(dataset, date);
      });

      test.describe('MapComponent', () => {
        MapComponentVisible(dataset);
        MapComponentInteractive(dataset);
        MapComponentInfoPopover();
        MapComponentLayersVisible(dataset);
        MapComponentLinesLayers(dataset);
      });

      test.describe('AggregatesComponent', () => {
        AggregatesComponentVisible(dataset);
        AggregateComponentTitleHover();
        AggregateComponentButtonClick(dataset);
        AggregateComponentEventCount(dataset);
        AggregateComponentHeaderColour(dataset);
      });

      test.describe('ChatComponent', () => {
        ChatComponentVisible(dataset, date);
        ChatComponentButtonClick(dataset);

        if (scenario !== 'no-trigger') {
          // REFACTOR
          ChatComponentAlertAreasList(dataset);
          ChatComponentEventClick();
          ChatComponentEventCount();
          ChatComponentInfoPopover();
        }

        if (scenario == 'warning') {
          ChatComponentSetTrigger(dataset);
        }
      });

      test.describe('DisasterTypeComponent', () => {
        DisasterTypeComponentVisible(dataset);
        DisasterTypeComponentSelect(dataset);
      });

      test.describe('TimelineComponent', () => {
        TimelineComponentVisible();

        if (scenario !== 'no-trigger') {
          // REFACTOR
          TimelineComponentNotClickable(dataset);
        }
      });

      test.describe('ActionSummaryComponent', () => {
        if (scenario === 'trigger') {
          // REFACTOR
          ActionSummaryTooltipTest();
        }
      });

      // Do this last, as it logs out the user
      test.describe('UserStateComponent', () => {
        UserStateComponentVisible(dataset);
        UserStateComponentLogout();
      });
    });
  });
});
