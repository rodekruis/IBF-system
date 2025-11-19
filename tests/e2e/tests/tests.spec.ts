import { test } from '@playwright/test';
import { datasets } from 'testData/datasets';
import { UserRole } from 'testData/enums';

import { getStorageState, mock } from '../helpers/utility.helper';
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
import LoginPageRedirect from './LoginPage/LoginPageRedirect';
import ManagePageAccount from './ManagePage/ManagePageAccount';
import ManagePageAccountSave from './ManagePage/ManagePageAccountSave';
import ManagePageRedirect from './ManagePage/ManagePageRedirect';
import ManagePageUsers from './ManagePage/ManagePageUsers';
import ManagePageVisible from './ManagePage/ManagePageVisible';
import MapComponentInfoPopover from './MapComponent/MapComponentInfoPopover';
import MapComponentInteractive from './MapComponent/MapComponentInteractive';
import MapComponentLayersVisible from './MapComponent/MapComponentLayersVisible';
import MapComponentLinesLayers from './MapComponent/MapComponentLinesLayers';
import MapComponentVisible from './MapComponent/MapComponentVisible';
import TimelineComponentNotClickable from './TimelineComponent/TimelineComponentNotClickable';
import TimelineComponentVisible from './TimelineComponent/TimelineComponentVisible';
import UserStateComponentLogout from './UserStateComponent/UserStateComponentLogout';
import UserStateComponentVisible from './UserStateComponent/UserStateComponentVisible';

datasets.forEach((dataset) => {
  const {
    country: { code },
    disasterType,
    configurationId,
    scenario,
  } = dataset;

  test.describe(`Dataset ${dataset.configurationId}: ${code} ${disasterType.name} ${scenario}`, () => {
    const date = new Date();
    const storageState = getStorageState(configurationId, UserRole.LocalAdmin);
    test.use({ storageState });

    test.beforeAll(async () => {
      // load a mock scenario
      await mock(disasterType.name, scenario, code, date);
    });

    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' }); // HACK: networkidle is not recommended
      await page.waitForSelector('[data-testid=loader]', { state: 'hidden' });
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

    test.describe('LoginPage', () => {
      LoginPageRedirect();
    });

    test.describe('ManagePage', () => {
      test.describe('LocalAdmin', () => {
        ManagePageVisible();
        ManagePageAccount();
        ManagePageAccountSave();
        ManagePageUsers();
      });

      test.describe('Viewer', () => {
        const storageState = getStorageState(configurationId, UserRole.Viewer);
        test.use({ storageState });

        ManagePageRedirect();
      });
    });

    // do this last, as it logs out the user
    test.describe('UserStateComponent', () => {
      UserStateComponentVisible(dataset);
      UserStateComponentLogout();
    });
  });
});
