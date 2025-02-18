import {
  AlertArea,
  DisasterSpecificProperties,
  EapAlertClass,
} from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class NotificationDataPerEventDto {
  triggerStatusLabel: AlertStatusLabelEnum;
  eventName: string;
  disasterSpecificProperties: DisasterSpecificProperties;

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

  alertAreas: AlertArea[];

  /**
   * The number of areas involved in the event.
   */
  nrOfAlertAreas: number;

  totalAffectedOfIndicator: number;
  issuedDate: Date;
  eapAlertClass: EapAlertClass;
}

export enum AlertStatusLabelEnum {
  Trigger = 'Trigger',
  Warning = 'Warning',
}

export class DisasterSpecificCopy {
  eventStatus: string;
  extraInfo: string;
  leadTimeString?: string;
  timestamp?: string;
}
