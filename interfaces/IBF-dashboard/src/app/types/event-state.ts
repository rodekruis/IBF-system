import { EventSummary } from '../services/event.service';

export class EventState {
  events: EventSummary[];
  event: EventSummary;
  activeTrigger: boolean;
  thresholdReached: boolean;
}
