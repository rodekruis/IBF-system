import { expect } from '@playwright/test';
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

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.chatDialogue = this.page.getByTestId('dialogue-turn-content');
  }

  async chatColumnIsVisibleForNoTriggerState({
    name,
    surname,
  }: {
    name: string;
    surname: string;
  }) {
    const cleanedString = chatDialogueWarnLabel.replace(/<\/?strong>/g, '');

    const optionsDate: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    };
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    const date = new Date();
    const formattedDate = date
      .toLocaleDateString('en-US', optionsDate)
      .split(', ');
    const lastModelRunDate = `${formattedDate[0]}, ${formattedDate[1].split(' ')[1]} ${formattedDate[1].split(' ')[0]} ${date.toLocaleTimeString('en-US', optionsTime)}`;

    const chatDialogueContent = cleanedString
      .replace('{{ name }}', `${name} ${surname}`)
      .replace('{{lastModelRunDate}}', lastModelRunDate);

    const chatDialogueContentNoAlerts =
      chatDialogueContentWelcomeNoTrigger.replace(/<\/?strong>/g, '');

    const welcomeChatDialogue = this.chatDialogue.filter({
      hasText: chatDialogueContent,
    });
    const noTriggerChatDialogue = this.chatDialogue.filter({
      hasText: chatDialogueContentNoAlerts,
    });

    await expect(welcomeChatDialogue).toBeVisible();
    await expect(noTriggerChatDialogue).toBeVisible();
  }
}

export default ChatComponent;
