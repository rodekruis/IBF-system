import { AdminLevel } from 'src/app/types/admin-level';
import { EapAction } from 'src/app/types/eap-action';

export class AlertArea {
  mainExposureValue: number;
  forecastSeverity: number;
  forecastTrigger: boolean;
  displayName: string;
  eapActions: EapAction[];
  eventPlaceCodeId: string;
  name: string;
  nameParent: string;
  placeCode: string;
  adminLevel: AdminLevel;
  startDate: string;
  submitDisabled: boolean;
  alertLabel?: AlertLabel;
}

export enum AlertLabel {
  alert = 'alert', // No-EAP
  trigger = 'trigger', // EAP trigger
  warning = 'warning', // EAP below-trigger
}
