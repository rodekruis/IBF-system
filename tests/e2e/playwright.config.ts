import { AzureReporterOptions } from '@alex_neo/playwright-azure-reporter/dist/playwright-azure-reporter';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { Dataset } from 'testData/types';
import UgandaDroughtWarning from 'testData/UgandaDroughtWarning.json';
import UgandaFloodsNoTrigger from 'testData/UgandaFloodsNoTrigger.json';
import UgandaFloodsTrigger from 'testData/UgandaFloodsTrigger.json';

const datasets: Dataset[] = [
  UgandaFloodsNoTrigger,
  UgandaFloodsTrigger,
  UgandaDroughtWarning,
];

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Extract configuration IDs from all datasets
const configurationIds = datasets.map((dataset) =>
  typeof dataset.configurationId === 'string'
    ? parseInt(dataset.configurationId, 10)
    : dataset.configurationId,
);
console.log('Using configuration IDs from datasets:', configurationIds);

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: process.env.NODE_ENV !== 'development',
  retries: 0,
  /* Opt out of parallel tests on CI. */
  reporter: [
    ['list'],
    [
      '@alex_neo/playwright-azure-reporter',
      {
        orgUrl: process.env.AZURE_DEV_URL,
        token: process.env.AZURE_DEVOPS_TOKEN,
        planId: 31870,
        projectName: 'IBF',
        environment: 'AQA',
        logging: true,
        testRunTitle: 'Playwright Test Suite',
        publishTestResultsMode: 'testRun',
        uploadAttachments: true,
        attachmentsType: ['screenshot', 'video', 'trace'],
        testRunConfig: {
          owner: {
            displayName: 'Krajewski, Piotr',
          },
          comment: 'Playwright Test Suite',
          configurationIds,
        },
      } as AzureReporterOptions,
    ],
  ],
  workers: 1,
  outputDir: './test-results',
  timeout: 60000,
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
  ],
});
