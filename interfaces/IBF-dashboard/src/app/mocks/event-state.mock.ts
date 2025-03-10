import { EventSummary } from 'src/app/services/event.service';
import { EventState } from 'src/app/types/event-state';

const MOCK_EVENT: EventSummary = {
  countryCodeISO3: 'KEN',
  firstIssuedDate: '2025-02-21T12:38:48.546Z',
  endDate: '2025-03-21T12:38:48.546Z',
  forecastTrigger: true,
  eventName: 'National',
  disasterSpecificProperties: {},
};
export const MOCK_EVENT_STATE: EventState = {
  events: [MOCK_EVENT, MOCK_EVENT],
  event: MOCK_EVENT,
};
