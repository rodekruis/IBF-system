import { JSDOM } from 'jsdom';

import { DisasterType } from '../../../src/api/disaster/disaster-type.enum';
import { EpidemicsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import {
  getEventTitle,
  mockEpidemics,
  sendNotification,
} from '../../helpers/utility.helper';

export async function testMalariaScenario(
  scenario: EpidemicsScenario,
  countryCodeISO3: string,
  accessToken: string,
): Promise<void> {
  const eventNames = ['0-month', '1-month', '2-month'];
  const disasterTypeLabel = DisasterType.Malaria;

  const mockResult = await mockEpidemics(
    scenario,
    countryCodeISO3,
    accessToken,
  );
  // Act
  const response = await sendNotification(
    countryCodeISO3,
    DisasterType.Malaria,
    accessToken,
  );
  // Assert
  // Also checking the status of the mockResult here as I think it also breaks often
  expect(mockResult.status).toBe(202);
  expect(response.status).toBe(201);

  if (scenario === EpidemicsScenario.Trigger) {
    expect(response.body.activeEvents.email).toBeDefined();
  } else {
    expect(response.body.activeEvents.email).toBeUndefined();
  }

  expect(response.body.activeEvents.whatsapp).toBeFalsy();
  expect(response.body.finishedEvents).toBeFalsy();

  // Parse the HTML content
  const dom = new JSDOM(response.body.activeEvents.email);
  const document = dom.window.document;

  // Get all span elements with data-testid="event-name" and their lower case text content
  const eventNamesInEmail = Array.from(
    document.querySelectorAll('[data-testid="event-name"]'),
    (el) => (el as Element).textContent.toLowerCase(),
  ).map((el) => el.trim());

  if (scenario === EpidemicsScenario.Trigger) {
    expect(eventNamesInEmail.length).toBe(eventNames.length);
  } else {
    expect(eventNamesInEmail.length).toBe(0);
  }

  if (scenario === EpidemicsScenario.Trigger) {
    // Check if each expected event name is included in at least one title
    for (const eventName of eventNames) {
      const eventTitle = getEventTitle(disasterTypeLabel, eventName);
      const hasEvent = eventNamesInEmail.some((eventNameInEmail) =>
        eventNameInEmail.includes(eventTitle),
      );
      expect(hasEvent).toBe(true);
    }
  }
}
