import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 1,
  /* Opt out of parallel tests on CI. */
  // reporter: [
  //   ['list'],
  //   [
  //     'playwright-qase-reporter',
  //     {
  //       captureLogs: false,
  //       debug: true,
  //       testops: {
  //         api: {
  //           token: process.env.QASE_TOKEN,
  //         },
  //         project: 'IBF',
  //         uploadAttachments: true,
  //         run: {
  //           complete: true,
  //         },
  //       },
  //     },
  //   ],
  // ],
  workers: 1,
  outputDir: './test-results',
  timeout: 30000,
  use: {
    baseURL: process.env.DASHBOARD_URL,
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
    acceptDownloads: true,
    actionTimeout: 10000,
    launchOptions: {
      downloadsPath: 'resources/downloads',
      args: ['--window-size=1920,1024'],
    },
    viewport: null,
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chromium',
      },
    },
    // {
    //   name: 'chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],
});
