import { EventSummary } from 'src/app/services/event.service';
import { EventState } from 'src/app/types/event-state';

const MOCK_EVENT: EventSummary = {
  countryCodeISO3: 'KEN',
  startDate: '2024-11-04',
  endDate: '2024-11-04',
  forecastTrigger: true,
  eventName: 'National',
  disasterSpecificProperties: {},
};
export const MOCK_EVENT_STATE: EventState = {
  events: [MOCK_EVENT, MOCK_EVENT],
  event: MOCK_EVENT,
  forecastTrigger: true,
};
