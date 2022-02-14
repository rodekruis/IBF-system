import { DateTime } from 'luxon';
import { LeadTime } from './lead-time';

export class TimelineState {
  today: DateTime;
  timeStepButtons: any[];
  activeLeadTime: LeadTime;
}
