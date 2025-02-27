import { DateTime } from 'luxon';
import { LeadTime, LeadTimeUnit } from 'src/app/types/lead-time';

export class TimelineState {
  today: DateTime;
  timeStepButtons: TimeStepButton[];
  activeLeadTime: LeadTime;
}

export class TimeStepButton {
  date: DateTime;
  unit: LeadTimeUnit;
  value: LeadTime;
  forecastAlert: boolean;
  forecastTrigger: boolean;
  active: boolean;
  eventNames: string[];
}
