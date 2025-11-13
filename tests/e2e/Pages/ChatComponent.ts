import { expect } from '@playwright/test';
import { format } from 'date-fns';
import * as os from 'os';
import { Locator, Page } from 'playwright';
import { User } from 'testData/types';

import DashboardPage from './DashboardPage';

const eventTooltipContent =
  'Select an area from this list or the map to monitor and manage the preplanned anticipatory actions (if applicable).';

class ChatComponent extends DashboardPage {
  readonly page: Page;
  readonly chatDialogue: Locator;
  readonly chatAboutButton: Locator;
  readonly chatGuideButton: Locator;
  readonly exportViewButton: Locator;
  readonly triggerLogButton: Locator;
  readonly chatIbfGuidePopOverTitle: Locator;
  readonly chatIbfGuidePopOverContent: Locator;
  readonly chatIbfGuideCloseButton: Locator;
  readonly exportViewPopOverTitle: Locator;
  readonly exportViewCloseButton: Locator;
  readonly windowsOsLink: Locator;
  readonly macOsLink: Locator;
  readonly linuxOsLink: Locator;
  readonly tooltipButton: Locator;
  readonly backDrop: Locator;
  readonly eapList: Locator;
  readonly districtChatEapListTitle: Locator;
  readonly setTriggerButton: Locator;
  readonly checkbox: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.chatDialogue = this.page.getByTestId('dialogue-turn-content');
    this.chatAboutButton = this.page.getByTestId('chat-about-trigger');
    this.chatGuideButton = this.page.getByTestId('ibf-guide-button');
    this.exportViewButton = this.page.getByTestId('export-view-button');
    this.triggerLogButton = this.page.getByTestId('trigger-log-button');
    this.chatIbfGuidePopOverTitle = this.page.getByTestId('ibf-guide-title');
    this.chatIbfGuidePopOverContent =
      this.page.getByTestId('ibf-guide-content');
    this.chatIbfGuideCloseButton = this.page.getByTestId(
      'ibf-guide-close-button',
    );
    this.exportViewPopOverTitle = this.page.getByTestId('export-view-title');
    this.exportViewCloseButton = this.page.getByTestId(
      'export-view-close-button',
    );
    this.windowsOsLink = this.page.getByTestId('export-view-windows-os');
    this.macOsLink = this.page.getByTestId('export-view-mac-os');
    this.linuxOsLink = this.page.getByTestId('export-view-linux-os');
    this.tooltipButton = this.page.getByTestId('tooltip-button');
    this.backDrop = page.locator('ion-backdrop').nth(2);
    this.eapList = this.page.getByRole('list');
    this.districtChatEapListTitle = this.page.locator('app-chat ion-col');
    this.setTriggerButton = this.page.getByTestId('set-trigger-button');
    this.checkbox = this.page.getByRole('checkbox');
  }

  async chatColumnIsVisible({
    date,
    scenario,
  }: {
    date: Date;
    scenario: string;
  }) {
    const lastUploadMessage = this.chatDialogue.filter({
      hasText: `The information in this portal is based on the model last run on ${format(date, 'EEEE, dd MMMM HH:mm')}.`,
    });

    await expect(lastUploadMessage).toBeVisible();

    if (scenario === 'no-trigger') {
      const noAlertsMessage = this.chatDialogue.filter({
        hasText:
          'To your right is the map of your country. You can turn data layers on and off. There are currently no alerts issued.',
      });

      await expect(noAlertsMessage).toBeVisible();
    }
  }

  async allDefaultButtonsArePresent() {
    await expect(this.chatAboutButton).toBeVisible();
    await expect(this.chatGuideButton).toBeVisible();
    await expect(this.exportViewButton).toBeVisible();
    await expect(this.triggerLogButton).toBeVisible();
  }

  async clickAndAssertAboutButton() {
    // Listen for new page event
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      await this.chatAboutButton.click(),
    ]);

    // Assert new page is opened
    expect(newPage).not.toBeNull();
    await newPage.close();
  }

  async clickAndAssertGuideButton() {
    // Open IBF Guide Popover
    await this.chatGuideButton.click();

    // Assert Popover Title and Iframe are visible
    const ibfGuidePopOverTitle =
      await this.chatIbfGuidePopOverTitle.innerText();
    const ibfGuidePopOverIframe =
      this.chatIbfGuidePopOverContent.locator('iframe');
    expect(ibfGuidePopOverTitle).toContain('IBF guide');
    await expect(this.chatIbfGuidePopOverContent).toBeVisible();
    await expect(ibfGuidePopOverIframe).toBeVisible();

    // Close IBF Guide Popover
    await this.chatIbfGuideCloseButton.click();
  }

  async clickAndAssertExportViewButton() {
    // Open Export View Popover
    await this.exportViewButton.click();

    // Define OS
    const platform = os.platform();

    // Assert Popover Title and link are visible
    if (platform === 'win32') {
      await expect(this.windowsOsLink).toBeVisible();
    } else if (platform === 'darwin') {
      await expect(this.macOsLink).toBeVisible();
    } else if (platform === 'linux') {
      await expect(this.linuxOsLink).toBeVisible();
    }

    // Close Export View Popover
    await this.exportViewCloseButton.click();
  }

  async clickAndAssertTriggerLogButton({ url }: { url: string }) {
    // Open Trigger Log
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      await this.triggerLogButton.click(),
    ]);

    // Assert new page is opened
    await expect(newPage).toHaveURL(url);
    await newPage.close();
  }

  async getEventCount() {
    const eventHeaders = this.page.locator('.event-header');
    return await eventHeaders.count();
  }

  async predictionButtonsAreActive() {
    const showPredictionButton = this.page.getByRole('button', {
      name: 'Show prediction',
    });
    const countPredictionButtons = await showPredictionButton.count();
    for (let i = 0; i < countPredictionButtons; i++) {
      const predictionButton = showPredictionButton.nth(i);
      await expect(predictionButton).toBeEnabled();
    }
    return countPredictionButtons;
  }

  async validateEventsInfoButtonsAreClickable() {
    const countTooltipInfoButton = await this.tooltipButton.count();

    for (let i = 0; i < countTooltipInfoButton; i++) {
      const toolTipInfoButton = this.tooltipButton.nth(i);
      await toolTipInfoButton.click();
      await this.validatePopOverText({ text: eventTooltipContent });
      await this.backDrop.click();
    }
  }

  async clickShowPredictionButton(scenario: string) {
    await this.page.waitForLoadState('domcontentloaded');
    const triggerChatDialogue = this.page
      .getByTestId('dialogue-turn-content')
      .filter({ hasText: scenario === 'trigger' ? 'Trigger:' : 'Warning:' }) // REFACTOR: the ':' is needed here. Fix better.
      .first()
      .getByTestId('event-switch-button');
    await triggerChatDialogue.click();
  }

  async setTrigger() {
    // click on the show prediction button in chat section
    await this.setTriggerButton.click();
    // continue in the popover
    // select first checkbox with a region
    await this.checkbox.first().click({ force: true });
    await this.page.getByRole('button', { name: 'Continue' }).click();
    // accept the terms and conditions checkbox
    await this.checkbox.first().click({ force: true });
    await this.page.getByRole('button', { name: 'Set trigger' }).click();
  }

  async validateEapList(eapActions: boolean) {
    // wait for the list to be fully loaded
    await this.page.waitForTimeout(200);
    if (eapActions) {
      await expect(this.eapList).toBeVisible();
    } else {
      await expect(this.eapList).not.toBeVisible();
    }
  }

  async validateChatTitleAndBreadcrumbs({
    adminAreaName,
    mainExposureIndicator,
    defaultAdminAreaLabelSingular,
  }: {
    adminAreaName: string;
    mainExposureIndicator: string;
    defaultAdminAreaLabelSingular: string;
  }) {
    const chatTitle = this.page
      .locator('app-chat ion-col')
      .filter({ hasText: defaultAdminAreaLabelSingular });
    await expect(chatTitle).toContainText(adminAreaName);

    const exposureText = this.page.getByTestId('main-exposure-indicator');
    await expect(exposureText).toContainText(mainExposureIndicator);
  }

  async validateEapListButtons() {
    const backButton = this.page.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeEnabled();
  }
}

export default ChatComponent;
