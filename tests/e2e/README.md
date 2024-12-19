# E2E testing suite <!-- omit from toc -->

> [!NOTE]
> This documentation is about the "E2E Playwright test suite" _only_;
> For other testing, see the [root-README](../README.md).

## Table of Contents <!-- omit from toc -->

- [Installation](#installation)
  - [Install E2E-test dependencies](#install-e2e-test-dependencies)
  - [Set necessary Environment-variables](#set-necessary-environment-variables)
- [Running tests](#running-tests)
  - [Using the command-line](#using-the-command-line)
  - [Using the VS Code-extension](#using-the-vs-code-extension)
- [Tests and Page Object Model (POM)](#tests-and-page-object-model-pom)
  - [What is Page Object Model (POM)?](#what-is-page-object-model-pom)
  - [Benefits of Using POM](#benefits-of-using-pom)
  - [Implementing POM](#implementing-pom)
- [Writing Tests](#writing-tests)
  - [Example Test](#example-test)
  - [Best Practices](#best-practices)
  - [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

---

## Installation

Clone the repository and run local Docker environment following the general [installation-documentation](../../README.md#getting-started).

### Install E2E-test dependencies

From the repository root-folder, move into this folder: `cd ./tests/e2e/`

Then, in _this_ folder, run:

```shell
npm install
```

Then, install Playwright Browsers(-drivers):

```shell
npx playwright install
```

### Set necessary Environment-variables

See the "Testing only"-section at the end of the [`./.env.example`](../../.env.example)-file.

Make sure to fill in all relevant variables in your local `./.env`-file.

## Running tests

Before running the tests, make sure the local environment is running.

### Using the command-line

```shell
npm test
```

Or run them in "headed" mode (you can see the browser)

```shell
npm test -- --headed
```

### Using the VS Code-extension

Use the built-in runner of the VS Code-extension: [`#ms-playwright.playwright`](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

![Screenshot of Playwright-extension in VS Code](https://github.com/microsoft/playwright/assets/13063165/348e18ff-f819-4caa-8f7e-f16c20724f56)

---

## Tests and Page Object Model (POM)

### What is Page Object Model (POM)?

The Page Object Model is a design pattern that creates an object repository for storing all web elements. It acts as an interface for interacting with web pages in your test scripts. This pattern helps to keep the code clean and readable by separating the test logic from the details of the UI elements.

### Benefits of Using POM

- **Improved Test Maintenance**: Changes in the UI require updates only in the page objects, not in the test scripts.
- **Code Reusability**: Page objects can be reused across multiple tests.
- **Separation of Concerns**: Separates the test logic from the UI logic, making the code easier to understand and maintain.

### Implementing POM

Page Classes
Create a page class for each page representing different module and/ or functionality in your application. Here is an example of how you can structure your HomePage class:

```ts
import { Locator, Page } from 'playwright';

import BasePage from './BasePage';

class LoginPage extends BasePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.usernameInput = this.page.getByLabel('E-mail');
    this.passwordInput = this.page.locator('input[type="password"]');
    this.loginButton = this.page.getByRole('button', { name: 'Log in' });
  }

  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

export default LoginPage;
```

## Writing Tests

### Example Test

Here is a simple example of writing a test using the POM structure:

```ts
import { test } from '@playwright/test';

import users from '../../../services/API-service/src/scripts/json/users.json';
import {
  getAccessToken,
  resetDB,
} from '../../../services/API-service/test/helpers/utility.helper';
import LoginPage from '../../Pages/LoginPage';

let accessToken: string;
const admin = users.find((user) => user.userRole === 'admin');

test.beforeEach(async () => {
  accessToken = await getAccessToken();
  await resetDB(accessToken);
});

test('Successfully Login', async ({ page }) => {
  // Login
  const loginPage = new LoginPage(page);

  await page.goto('/');
  await loginPage.login(admin?.email, admin?.password);
  await page.waitForURL((url) => url.pathname === '/');
});
```

### Best Practices

- **Keep Tests Independent**: Each test should be able to run independently of others.
- **Use Meaningful Names**: Name your page objects and methods clearly to reflect their purpose.
- **Avoid Hardcoding**: Use variables and configuration files (like translation file) to manage test data.

### Common Issues and Troubleshooting

- **Element Not Found**: Ensure the selectors in your page objects are correct, unique and are loaded in DOM.
- **Timeouts**: Increase the default timeout if elements take longer to load.
- **Test Flakiness**: Use wait methods to handle dynamic content and animations.

For extended documentation see: <https://playwright.dev/docs/getting-started-vscode>
