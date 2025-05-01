import { JSDOM } from 'jsdom';

import { DisasterType } from '../../../helpers/API-service/enum/disaster-type.enum';
import { TyphoonScenario } from '../../../helpers/API-service/enum/mock-scenario.enum';
import { mock, notify } from '../../../helpers/utility.helper';

export async function testTyphoonScenario(
  scenario: TyphoonScenario,
  countryCodeISO3: string,
  token: string,
): Promise<boolean> {
  const nrOfEvents = 1;

  const mockResult = await mock(
    token,
    scenario,
    DisasterType.Typhoon,
    countryCodeISO3,
    null,
  );
  // Act
  const response = await notify(token, countryCodeISO3, DisasterType.Typhoon);

  // Assert
  // Also checking the status of the mockResult here as I think it also breaks often
  expect(mockResult.status).toBe(202);
  expect(response.status).toBe(201);
  expect(response.body.activeEvents.email).toBeDefined();

  expect(response.body.activeEvents.whatsapp).toBeFalsy();
  expect(response.body.finishedEvents).toBeFalsy();

  // Parse the HTML content
  const emailContent = response.body.activeEvents.email;
  const dom = new JSDOM(emailContent);
  const document = dom.window.document;

  // Get all span elements with data-testid="event-name" and their lower case text content
  const eventNamesInEmail = Array.from(
    document.querySelectorAll('[data-testid="event-name"]'),
    (el) => (el as Element).textContent?.toLowerCase() ?? '',
  );

  expect(eventNamesInEmail.length).toBe(nrOfEvents);

  if (scenario === TyphoonScenario.Trigger) {
    expect(emailContent).toContain('Expected to make landfall on');
  } else if (scenario === TyphoonScenario.Warning) {
    expect(emailContent).toContain(
      'Not predicted to reach trigger thresholds.',
    );
  } else if (scenario === TyphoonScenario.NoLandfallTrigger) {
    expect(emailContent).toContain(
      'Expected to reach the point closest to land on',
    );
  } else if (scenario === TyphoonScenario.NoLandfallYetWarning) {
    expect(emailContent).toContain(
      'The landfall time prediction cannot be determined yet',
    );
  } else if (scenario === TyphoonScenario.OngoingTrigger) {
    expect(emailContent).toContain('Has already made landfall');
  }

  return true;
}
