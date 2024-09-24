import { Page } from 'playwright';

class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}

export default BasePage;
