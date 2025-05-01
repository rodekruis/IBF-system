import { reset } from '../helpers/utility.helper';
import adminAreaTests from './admin-areas/admin-areas.test';
import adminAreaAggregatesTests from './admin-areas/aggregates.test';
import communityNotificationTests from './community-notification/community-notification.test';
import createCountryTests from './country/create-country.test';
import emailTests from './email/emails.test';
import getEventsTests from './events/get-events.test';
import processEventsTests from './events/process-events.test';
import setTriggerTests from './events/set-trigger.test';
import typhoonTrackTests from './typhoon-track/typhoon-track.test';
import usersTests from './users/users.test';

describe('integration tests', () => {
  beforeAll(async () => {
    await reset();
  });

  communityNotificationTests();

  createCountryTests();

  emailTests();

  adminAreaTests();
  adminAreaAggregatesTests();

  typhoonTrackTests();

  usersTests();

  getEventsTests();
  processEventsTests();
  setTriggerTests(); // Putting this test last. If not, seems to make the subsequent test flaky.
});
