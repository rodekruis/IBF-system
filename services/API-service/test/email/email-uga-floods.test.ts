import {
  getAccessToken,
  mockFloods,
  resetDB,
  sendNotification,
} from '../helpers/utility.helper';
import { FloodsScenario } from '../../src/scripts/enum/mock-scenario.enum';
import { DisasterType } from '../../src/api/disaster/disaster-type.enum';
import { JSDOM } from 'jsdom';
import scenarios from '../../src/scripts/mock-data/floods/uga/scenarios.json';
import disaters from '../../src/scripts/json/disasters.json';

const disasterType = DisasterType.Floods;
const countryCodeISO3 = 'UGA';
describe('Should send an email for uga floods', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('default', async () => {
    // Arrange
    const scenario = FloodsScenario.Default;
    await testFloodScenario(scenario, accessToken);
  });

  it('warning', async () => {
    // Arrange
    const scenario = FloodsScenario.Warning;
    await testFloodScenario(scenario, accessToken);
  });

  it('warning-to-trigger', async () => {
    // Arrange
    const scenario = FloodsScenario.WarningToTrigger;
    await testFloodScenario(scenario, accessToken);
  });

  it('no-trigger', async () => {
    // Arrange
    const scenario = FloodsScenario.NoTrigger;
    await testFloodScenario(scenario, accessToken);
  });
});

async function testFloodScenario(
  scenario: FloodsScenario,
  accessToken: string,
): Promise<void> {
  const disasterTypeLabel = disaters.find(
    (d) => d.disasterType === disasterType,
  ).label;
  const scenarioSeed = scenarios.find((s) => s.scenarioName === scenario);
  const mockResult = await mockFloods(scenario, countryCodeISO3, accessToken);
  const eventsSeed = scenarioSeed.events ? scenarioSeed.events : [];
  // Act
  const response = await sendNotification(
    countryCodeISO3,
    DisasterType.Floods,
    accessToken,
  );

  // Assert
  // Also checking the status of the mockResult here as I think it also breaks often
  expect(mockResult.status).toBe(202);
  expect(response.status).toBe(201);
  if (eventsSeed.length > 0) {
    expect(response.body.activeEvents.email).toBeDefined();
  } else {
    expect(response.body.activeEvents.email).toBeFalsy();
  }
  expect(response.body.activeEvents.whatsapp).toBeFalsy();
  expect(response.body.finishedEvents).toBeFalsy();

  // Parse the HTML content
  const dom = new JSDOM(response.body.activeEvents.email);
  const document = dom.window.document;

  // Get all span elements with apiTest="eventName" and their lower case text content
  const eventNamesInEmail = Array.from(
    document.querySelectorAll('span[apiTest="eventName"]'),
    (el) => (el as Element).textContent.toLowerCase(),
  );

  expect(eventNamesInEmail.length).toBe(eventsSeed.length);

  // Check if there are elements with the desired text content
  for (const event of eventsSeed) {
    const eventTitle = `${disasterTypeLabel} ${event.eventName}`.toLowerCase();
    const hasEvent = eventNamesInEmail.some((eventName) =>
      eventName.includes(eventTitle),
    );
    expect(hasEvent).toBe(true);
  }
}
