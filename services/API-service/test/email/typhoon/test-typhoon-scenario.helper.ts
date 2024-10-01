import { JSDOM } from 'jsdom';

import { DisasterType } from '../../../src/api/disaster/disaster-type.enum';
import { TyphoonScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import {
  getEventTitle,
  mockTyphoon,
  sendNotification,
} from '../../helpers/utility.helper';

export async function testTyphoonScenario(
  scenario: TyphoonScenario,
  countryCodeISO3: string,
  accessToken: string,
): Promise<boolean> {
  const nrOfEvents = 1;
  const eventName = 'Mock typhoon';
  const disasterTypeLabel = DisasterType.Typhoon;

  // const disasterType = DisasterType.Typhoon;
  // const disasterTypeLabel = disasters.find(
  //   (d) => d.disasterType === disasterType,
  // ).label;
  const mockResult = await mockTyphoon(scenario, countryCodeISO3, accessToken);
  // Act
  const response = await sendNotification(
    countryCodeISO3,
    DisasterType.Typhoon,
    accessToken,
  );
  // Assert
  // Also checking the status of the mockResult here as I think it also breaks often
  expect(mockResult.status).toBe(202);
  expect(response.status).toBe(201);
  expect(response.body.activeEvents.email).toBeDefined();

  expect(response.body.activeEvents.whatsapp).toBeFalsy();
  expect(response.body.finishedEvents).toBeFalsy();

  // Parse the HTML content
  const dom = new JSDOM(response.body.activeEvents.email);
  const document = dom.window.document;

  // Get all span elements with data-testid="event-name" and their lower case text content
  const eventNamesInEmail = Array.from(
    document.querySelectorAll('[data-testid="event-name"]'),
    (el) => (el as Element).textContent.toLowerCase(),
  );

  expect(eventNamesInEmail.length).toBe(nrOfEvents);

  // Check if there are elements with the desired text content
  for (const eventNameInEmail of eventNamesInEmail) {
    const eventTitle = getEventTitle(disasterTypeLabel, eventName);
    const hasEvent = eventNameInEmail.includes(eventTitle);
    expect(hasEvent).toBe(true);
  }

  return true;
}
