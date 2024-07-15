import { EapAlertClass, TriggeredArea } from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class NotificationDataPerEventDto {
  triggerStatusLabel: TriggerStatusLabelEnum;
  eventName: string;
  disasterSpecificCopy: DisasterSpecificCopy;

  /**
   * The day that the event starts.
   */
  firstLeadTime: LeadTime;

  /**
   * The day that the event triggers. This could be different from firstLeadTimeString.
   * For example, a flood could transition from a warning (a chance of a small flood)
   * to an EAP trigger (a larger chance of a bigger flood).
   */
  firstTriggerLeadTime: LeadTime;

  firstLeadTimeString: string;
  firstTriggerLeadTimeString: string;

  triggeredAreas: TriggeredArea[];

  /**
   * The number of areas where the event triggers.
   */
  nrOfTriggeredAreas: number;

  totalAffectedOfIndicator: number;
  mapImage?: Buffer;
  issuedDate: Date;
  eapAlertClass: EapAlertClass;
}

export enum TriggerStatusLabelEnum {
  Trigger = 'Trigger',
  Warning = 'Warning',
}

export class DisasterSpecificCopy {
  eventStatus: string;
  extraInfo: string;
  leadTimeString?: string;
  timestamp?: string;
}
