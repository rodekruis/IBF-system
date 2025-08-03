import { Event } from 'src/app/services/event.service';

export class EventState {
  events: Event[] | null;
  event: Event | null;
}
