import {
  getAccessToken,
  mockDynamicData,
  resetDB,
  sendNotification,
} from '../../helpers/utility.helper';
import { DisasterType } from '../../../src/api/disaster/disaster-type.enum';
import { JSDOM } from 'jsdom';

const countryCodeISO3 = 'UGA';
const disasterType = DisasterType.Drought;

describe('Should send an email for uga drought', () => {
  let accessToken: string;

  beforeEach(async () => {
    accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  it('triggered in january', async () => {
    // Mock settings
    const dateJanuary = new Date(new Date().getFullYear(), 0, 1);
    const triggered = true;

    // TODO: Do not hard code this but get it from the seed data
    const expectedEventNames = ['Mam', 'Karamoja'];

    const nrOfEvents = 2;
    const mockResult = await mockDynamicData(
      disasterType,
      countryCodeISO3,
      triggered,
      accessToken,
      dateJanuary,
    );
    const response = await sendNotification(
      countryCodeISO3,
      disasterType,
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

    // Get all span elements with apiTest="eventName" and their lower case text content
    const eventNamesInEmail = Array.from(
      document.querySelectorAll('span[apiTest="eventName"]'),
      (el) => (el as Element).textContent.toLowerCase(),
    );

    expect(eventNamesInEmail.length).toBe(nrOfEvents);

    // Check if each expected event name is included in at least one title
    for (const expectedEventName of expectedEventNames) {
      const eventTitle = `${disasterType} ${expectedEventName}`.toLowerCase();
      const hasEvent = eventNamesInEmail.some((eventNameInEmail) =>
        eventNameInEmail.includes(eventTitle),
      );
      expect(hasEvent).toBe(true);
    }
  });

  it('non triggered any month', async () => {
    // Mock settings
    const currentDate = new Date();
    const triggered = false;

    const mockResult = await mockDynamicData(
      disasterType,
      countryCodeISO3,
      triggered,
      accessToken,
      currentDate,
    );
    const response = await sendNotification(
      countryCodeISO3,
      disasterType,
      accessToken,
    );

    // Assert
    // Also checking the status of the mockResult here as I think it also breaks often
    expect(mockResult.status).toBe(202);
    expect(response.status).toBe(201);
    expect(response.body.activeEvents.email).toBeFalsy();
    expect(response.body.activeEvents.whatsapp).toBeFalsy();
  });

  // TODO: Add more tests for different months when this issue is fixed AB#27890
});
