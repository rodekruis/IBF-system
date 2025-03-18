import { AzureReporterOptions } from '@alex_neo/playwright-azure-reporter/dist/playwright-azure-reporter';
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

interface TestCaseWithTitle {
  title: string;
}

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const configurationIds = process.env.CONFIGURATION_IDS
  ? process.env.CONFIGURATION_IDS.split(',').map(Number)
  : [72];

// Function to extract test case ID from the title, with the configuration ID added
const extractTestCaseId = (testTitle: string, configId: number): string => {
  const regex = /\[(\d+)\]/;
  const match = regex.exec(testTitle);
  return match
    ? `[${match[1]}] Config-${configId}`
    : `Unknown Config-${configId}`;
};

// Debug log to ensure the configuration IDs are being read correctly
console.log('Using configuration IDs:', configurationIds);

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: false,
  forbidOnly: process.env.NODE_ENV !== 'development',
  retries: 0,
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
          configurationIds, // Uses parsed array from .env
          testPointMapper: (testCase: TestCaseWithTitle, configId: number) => {
            // Log the mapping of test case to configuration ID
            const testCaseId = extractTestCaseId(testCase.title, configId);
            console.log(
              `Mapping test case ${testCaseId} to config ${configId}`,
            );
            return {
              testCaseId,
              configurationId: configId,
            };
          },
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
  projects: configurationIds.map((configId) => ({
    name: `chromium-${configId}`,
    use: {
      channel: 'chromium',
      extraHTTPHeaders: {
        'x-config-id': String(configId),
      },
    },
  })),
});
