import { EventSummary } from 'src/app/services/event.service';

export class EventState {
  events: EventSummary[];
  event: EventSummary;
  forecastTrigger: boolean;
}
