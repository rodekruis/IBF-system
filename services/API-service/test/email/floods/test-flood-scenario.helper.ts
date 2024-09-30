import { JSDOM } from 'jsdom';

import { DisasterType } from '../../../src/api/disaster/disaster-type.enum';
import { FloodsScenario } from '../../../src/scripts/enum/mock-scenario.enum';
import disasters from '../../../src/scripts/json/disasters.json';
import {
  getEventTitle,
  mockFloods,
  sendNotification,
} from '../../helpers/utility.helper';

interface Event {
  eventName: string;
  leadTime: string;
}

export interface TestFloodScenarioDto {
  events: Event[];
  countryCodeISO3: string;
  accessToken: string;
}

export async function testFloodScenario(
  scenario: FloodsScenario,
  params: TestFloodScenarioDto,
): Promise<void> {
  const { events, countryCodeISO3, accessToken } = params;
  const disasterType = DisasterType.Floods;
  const disasterTypeLabel = disasters.find(
    (d) => d.disasterType === disasterType,
  ).label;
  const mockResult = await mockFloods(scenario, countryCodeISO3, accessToken);
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
  if (events.length > 0) {
    expect(response.body.activeEvents.email).toBeDefined();
  } else {
    expect(response.body.activeEvents.email).toBeFalsy();
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
  );

  expect(eventNamesInEmail.length).toBe(events.length);

  // Check if there are elements with the desired text content
  for (const event of events) {
    const eventTitle = getEventTitle(disasterTypeLabel, event.eventName);
    const hasEvent = eventNamesInEmail.some((eventName) =>
      eventName.includes(eventTitle),
    );
    expect(hasEvent).toBe(true);
  }
}
