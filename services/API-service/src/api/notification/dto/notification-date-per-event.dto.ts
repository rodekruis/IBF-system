import { TriggeredArea } from '../../../shared/data.model';
import { LeadTime } from '../../admin-area-dynamic-data/enum/lead-time.enum';

export class NotificationDataPerEventDto {
  triggerStatusLabel: TriggerStatusLabelEnum;
  eventName: string;
  disasterSpecificCopy: DisasterSpecificCopy;
  firstLeadTime: LeadTime;
  triggeredAreas: TriggeredArea[];
  nrOfTriggeredAreas: number;
  startDateEventString: string;
  totalAffectectedOfIndicator: number;
  mapImage?: Buffer;
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
