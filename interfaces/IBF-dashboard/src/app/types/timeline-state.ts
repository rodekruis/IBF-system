import { DateTime } from 'luxon';
import { LeadTime, LeadTimeUnit } from './lead-time';

export class TimelineState {
  today: DateTime;
  timeStepButtons: TimeStepButton[];
  activeLeadTime: LeadTime;
}

export class TimeStepButton {
  date: DateTime;
  unit: LeadTimeUnit;
  value: LeadTime;
  alert: boolean;
  disabled: boolean;
  active: boolean;
  noEvent: boolean;
  eventName: string;
  duration?: number;
}
