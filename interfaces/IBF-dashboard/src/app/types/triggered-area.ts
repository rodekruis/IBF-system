import { EapAction } from './eap-action';

export class TriggeredArea {
  actionsValue: number;
  activeTrigger: boolean;
  displayName: string;
  eapActions: EapAction[];
  eventPlaceCodeId: string;
  name: string;
  nameParent: string;
  placeCode: string;
  startDate: string;
  stopped: boolean;
  stoppedDate: string;
  submitDisabled: boolean;
}
