import { EventSummary } from '../services/event.service';

export class EventState {
  events: EventSummary[];
  event: EventSummary;
  activeEvent: EventSummary;
  activeTrigger: any;
}
