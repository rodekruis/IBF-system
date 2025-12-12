import { AlertArea } from 'src/app/types/alert-area';
import { AlertLevel } from 'src/app/types/alert-level';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { LeadTime } from 'src/app/types/lead-time';

export class Event {
  countryCodeISO3: string;
  disasterType: DisasterTypeKey;
  firstIssuedDate: string;
  endDate: string;
  forecastTrigger: boolean;
  eventName: string;
  firstLeadTime?: LeadTime;
  firstLeadTimeLabel?: string;
  firstLeadTimeDate?: string;
  firstTriggerLeadTime?: LeadTime;
  firstTriggerLeadTimeDate?: string;
  timeUnit?: string;
  duration?: number;
  disasterSpecificProperties: DisasterSpecificProperties;
  header?: string;
  alertAreas?: AlertArea[];
  nrAlertAreas?: number;
  mainExposureValueSum?: number;
  alertLevel: AlertLevel;
  userTrigger: boolean;
  userTriggerDate: string;
  userTriggerName: string;
}

export class DisasterSpecificProperties {
  typhoonLandfall?: boolean;
  typhoonNoLandfallYet?: boolean;
}

export class EventState {
  events: Event[];
  event: Event;
}
