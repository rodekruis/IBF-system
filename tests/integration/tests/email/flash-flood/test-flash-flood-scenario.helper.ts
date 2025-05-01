import { JSDOM } from 'jsdom';

import { DisasterType } from '../../../helpers/API-service/enum/disaster-type.enum';
import { FlashFloodsScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { mock, notify } from '../../../helpers/utility.helper';

export async function testFlashFloodScenario(
  scenario: FlashFloodsScenario,
  countryCodeISO3: string,
  eventNames: string[] = [],
  token: string,
): Promise<boolean> {
  const mockResult = await mock(
    scenario,
    DisasterType.FlashFloods,
    countryCodeISO3,
    null,
    token,
  );
  // Act
  const response = await notify(
    countryCodeISO3,
    DisasterType.FlashFloods,
    token,
  );
  // Assert
  // Also checking the status of the mockResult here as I think it also breaks often
  expect(mockResult.status).toBe(202);
  expect(response.status).toBe(201);

  if (scenario === FlashFloodsScenario.NoTrigger) {
    expect(response.body.activeEvents.email).toBeUndefined();
  } else {
    expect(response.body.activeEvents.email).toBeDefined();
  }

  expect(response.body.activeEvents.whatsapp).toBeFalsy();
  expect(response.body.finishedEvents).toBeFalsy();

  // Parse the HTML content
  const dom = new JSDOM(response.body.activeEvents.email);
  const document = dom.window.document;

  // Get all span elements with data-testid="event-name" and their lower case text content
  const eventNamesInEmail = Array.from(
    document.querySelectorAll('[data-testid="event-name"]'),
    (el) => (el as Element).textContent?.toLowerCase() ?? '',
  ).map((el) => el.trim());

  if (scenario === FlashFloodsScenario.NoTrigger) {
    expect(eventNamesInEmail.length).toBe(0);
  } else {
    expect(eventNamesInEmail.length).toBe(eventNames.length);
  }

  if (scenario !== FlashFloodsScenario.NoTrigger) {
    // Check if each expected event name is included in at least one title
    for (const eventName of eventNames) {
      const hasEvent = eventNamesInEmail.some((eventNameInEmail) =>
        eventNameInEmail.includes(eventName.toLowerCase()),
      );
      expect(hasEvent).toBe(true);
    }
  }

  if (scenario !== FlashFloodsScenario.TriggerOngoingRumphi) {
    return true;
  }

  // For ongoing scenario, simulate a 2nd pipeline run to test that it does not send an email the 2nd time
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const removeEvents = false;
  await mock(
    scenario,
    DisasterType.FlashFloods,
    countryCodeISO3,
    tomorrowDate,
    token,
    removeEvents,
  );
  // Act
  const secondPipelineRunEmailResponse = await notify(
    countryCodeISO3,
    DisasterType.FlashFloods,
    token,
  );
  expect(
    secondPipelineRunEmailResponse.body.activeEvents.email,
  ).toBeUndefined();

  return true;
}
