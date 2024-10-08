import { expect } from '@playwright/test';
import { format } from 'date-fns';
import { Locator, Page } from 'playwright';

import EnglishTranslations from '../../interfaces/IBF-dashboard/src/assets/i18n/en.json';
import DashboardPage from './DashboardPage';

const chatDialogueContentWelcomeNoTrigger =
  EnglishTranslations['chat-component'].floods['no-event-no-trigger'].welcome;
const chatDialogueWarnLabel =
  EnglishTranslations['chat-component'].common['warn-label'].message;

class ChatComponent extends DashboardPage {
  readonly page: Page;
  readonly chatDialogue: Locator;
  readonly chatAboutButton: Locator;
  readonly chatGuideButton: Locator;
  readonly exportViewButton: Locator;
  readonly triggerLogButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.chatDialogue = this.page.getByTestId('dialogue-turn-content');
    this.chatAboutButton = this.page.getByTestId('chat-about-trigger');
    this.chatGuideButton = this.page.getByTestId('ibf-guide-button');
    this.exportViewButton = this.page.getByTestId('export-view-button');
    this.triggerLogButton = this.page.getByTestId('trigger-log-button');
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

  async allChatButtonsArePresent() {
    await expect(this.chatAboutButton).toBeVisible();
    await expect(this.chatGuideButton).toBeVisible();
    await expect(this.exportViewButton).toBeVisible();
    await expect(this.triggerLogButton).toBeVisible();
  }
}

export default ChatComponent;
