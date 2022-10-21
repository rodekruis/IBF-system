import { EventSummary } from '../services/event.service';

export class EventState {
  events: EventSummary[];
  event: EventSummary;
  activeEvent: boolean;
  activeTrigger: boolean;
  thresholdReached: boolean;
}
