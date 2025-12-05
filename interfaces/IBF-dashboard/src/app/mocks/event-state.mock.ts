import { MOCK_ALERT_AREAS } from 'src/app/mocks/alert-areas.mock';
import { AlertLevel } from 'src/app/types/alert-level';
import { Event, EventState } from 'src/app/types/event';

const MOCK_EVENT: Event = {
  countryCodeISO3: 'KEN',
  firstIssuedDate: '2025-02-21T12:38:48.546Z',
  endDate: '2025-03-21T12:38:48.546Z',
  forecastTrigger: true,
  alertLevel: AlertLevel.TRIGGER,
  eventName: 'National',
  disasterSpecificProperties: {},
  userTrigger: false,
  userTriggerDate: null,
  userTriggerName: null,
  alertAreas: MOCK_ALERT_AREAS,
};
export const MOCK_EVENT_STATE: EventState = {
  events: [MOCK_EVENT, MOCK_EVENT],
  event: MOCK_EVENT,
};
