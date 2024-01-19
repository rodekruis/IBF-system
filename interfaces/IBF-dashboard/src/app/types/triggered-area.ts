import { AdminLevel } from './admin-level';
import { EapAction } from './eap-action';

export class TriggeredArea {
  actionsValue: number;
  triggerValue: number;
  activeTrigger: boolean;
  displayName: string;
  eapActions: EapAction[];
  eventPlaceCodeId: string;
  name: string;
  nameParent: string;
  placeCode: string;
  adminLevel: AdminLevel;
  startDate: string;
  stopped: boolean;
  stoppedDate: string;
  submitDisabled: boolean;
  alertClass?: string;
}
