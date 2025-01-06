import { expect } from '@playwright/test';
import { format } from 'date-fns';
import * as os from 'os';
import { Locator, Page } from 'playwright';

import EnglishTranslations from '../../../interfaces/IBF-dashboard/src/assets/i18n/en.json';
import DashboardPage from './DashboardPage';

const chatDialogueContentWelcomeNoTrigger =
  EnglishTranslations['chat-component'].floods['no-event-no-trigger'].welcome;
const chatDialogueWarnLabel =
  EnglishTranslations['chat-component'].common['warn-label'].message;
const eventTooltipContent =
  EnglishTranslations['chat-component'].common['event-tooltip'];

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
  }

  async chatColumnIsVisibleForNoTriggerState({
    firstName,
    lastName,
  }: {
    firstName: string;
    lastName: string;
  }) {
    // String cleaning to remove <strong> tags and replace placeholders with actual values
    const cleanedString = chatDialogueWarnLabel.replace(/<\/?strong>/g, '');

    const date = new Date();
    const formattedDate = format(date, 'EEEE, dd MMMM');
    const formattedTime = format(date, 'HH:mm');

    const lastModelRunDate = `${formattedDate} ${formattedTime}`;

    // Formatted Strings
    const chatDialogueContent = cleanedString
      .replace('{{ name }}', `${firstName} ${lastName}`)
      .replace('{{lastModelRunDate}}', lastModelRunDate);
    const chatDialogueContentNoAlerts =
      chatDialogueContentWelcomeNoTrigger.replace(/<\/?strong>/g, '');

    // Locators based on data-testid and filtered by formatted strings
    const welcomeChatDialogue = this.chatDialogue.filter({
      hasText: chatDialogueContent,
    });
    const noTriggerChatDialogue = this.chatDialogue.filter({
      hasText: chatDialogueContentNoAlerts,
    });
    // Assertions
    await expect(welcomeChatDialogue).toBeVisible();
    await expect(noTriggerChatDialogue).toBeVisible();
  }

  async chatColumnIsVisibleForTriggerState({
    firstName,
    lastName,
  }: {
    firstName: string;
    lastName: string;
  }) {
    // String cleaning to remove <strong> tags and replace placeholders with actual values
    const cleanedString = chatDialogueWarnLabel.replace(/<\/?strong>/g, '');

    const date = new Date();
    const formattedDate = format(date, 'EEEE, dd MMMM');
    const formattedTime = format(date, 'HH:mm');

    const lastModelRunDate = `${formattedDate} ${formattedTime}`;

    // Formatted Strings
    const chatDialogueContent = cleanedString
      .replace('{{ name }}', `${firstName} ${lastName}`)
      .replace('{{lastModelRunDate}}', lastModelRunDate);

    // Locators based on data-testid and filtered by formatted strings
    const welcomeChatDialogue = this.chatDialogue.filter({
      hasText: chatDialogueContent,
    });

    // Assertions
    await expect(welcomeChatDialogue).toBeVisible();
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
    expect(ibfGuidePopOverTitle).toContain('IBF Guide');
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
    const counttoolTipInfoButton = await this.tooltipButton.count();

    for (let i = 0; i < counttoolTipInfoButton; i++) {
      const toolTipInfoButton = this.tooltipButton.nth(i);
      await toolTipInfoButton.click();
      await this.validatePopOverText({ text: eventTooltipContent });
      await this.backDrop.click();
    }
  }
}

export default ChatComponent;
