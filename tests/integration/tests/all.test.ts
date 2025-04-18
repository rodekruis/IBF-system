import { getAccessToken, resetDB } from '../helpers/utility.helper';
import adminAreaTests from './admin-areas/admin-areas.test';
import adminAreaAggregatesTests from './admin-areas/aggregates.test';
import communityNotificationTests from './community-notification/community-notification.test';
import createCountryTests from './country/create-country.test';
import emailUgaDroughtTests from './email/drought/email-uga-drought.test';
import emailMwiFlashFloodTests from './email/flash-flood/email-mwi-flash-flood.test';
import emailSsdFloodsTests from './email/floods/email-ssd-floods.test';
import emailUgaFloodsTests from './email/floods/email-uga-floods.test';
import emailEthMalariaTests from './email/malaria/email-eth-malaria.test';
import emailPhlTyphoonTests from './email/typhoon/email-phl-typhoon.test';
import getEventsTests from './events/get-events.test';
import processEventsTests from './events/process-events.test';
import setTriggerTests from './events/set-trigger.test';
import typhoonTrackTests from './typhoon-track/typhoon-track.test';
import manageUsersTests from './users/manage-users.test';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    const accessToken = await getAccessToken();
    await resetDB(accessToken);
  });

  describe('Community notification', () => {
    communityNotificationTests();
  });

  describe('Country', () => {
    createCountryTests();
  });

  describe('Email', () => {
    emailUgaDroughtTests();
    emailEthMalariaTests();
    emailMwiFlashFloodTests();
    emailPhlTyphoonTests();
    emailSsdFloodsTests();
    emailUgaFloodsTests();
  });

  describe('Admin areas', () => {
    adminAreaTests();
    adminAreaAggregatesTests();
  });

  describe('Typhoon track', () => {
    typhoonTrackTests();
  });

  describe('Manage users', () => {
    manageUsersTests();
  });

  describe('Events', () => {
    getEventsTests();
    processEventsTests();
    setTriggerTests(); // Putting this test last. If not, seems to make the subsequent test flaky.
  });
});
