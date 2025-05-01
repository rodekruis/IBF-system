import { JSDOM } from 'jsdom';

import { DisasterType } from '../../../helpers/API-service/enum/disaster-type.enum';
import { DroughtScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { mock, notify } from '../../../helpers/utility.helper';

export async function testDroughtScenario(
  scenario: DroughtScenario,
  countryCodeISO3: string,
  date: Date,
  expectedEventNames: string[] = [],
  token: string,
): Promise<boolean> {
  const nrOfEvents = expectedEventNames.length;
  const mockResult = await mock(
    token,
    scenario,
    DisasterType.Drought,
    countryCodeISO3,
    date,
  );
  const response = await notify(token, countryCodeISO3, DisasterType.Drought);

  // Assert
  // Also checking the status of the mockResult here as I think it also breaks often
  expect(mockResult.status).toBe(202);
  expect(response.status).toBe(201);
  expect(response.body.activeEvents.whatsapp).toBeFalsy();
  expect(response.body.finishedEvents).toBeFalsy();

  if (scenario === DroughtScenario.NoTrigger) {
    expect(response.body.activeEvents.email).toBeFalsy();
    return true;
  }

  expect(response.body.activeEvents.email).toBeDefined();

  // Parse the HTML content
  const dom = new JSDOM(response.body.activeEvents.email);
  const document = dom.window.document;

  // Get all span elements with data-testid="event-name" and their lower case text content
  const eventNamesInEmail = Array.from(
    document.querySelectorAll('[data-testid="event-name"]'),
    (el) => (el as Element).textContent?.toLowerCase() ?? '',
  );

  expect(eventNamesInEmail.length).toBe(nrOfEvents);

  // Check if each expected event name is included in at least one title
  for (const expectedEventName of expectedEventNames) {
    const hasEvent = eventNamesInEmail.some((eventNameInEmail) =>
      eventNameInEmail.includes(expectedEventName.toLowerCase()),
    );
    expect(hasEvent).toBe(true);
  }

  return true;
}
