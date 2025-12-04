import { AdminLevel } from 'src/app/types/admin-level';
import { AlertLevel } from 'src/app/types/alert-level';
import { EapAction } from 'src/app/types/eap-action';

export class AlertArea {
  mainExposureValue: number;
  forecastSeverity: number;
  forecastTrigger: boolean;
  userTriggerName: string;
  eapActions: EapAction[];
  eventPlaceCodeId: string;
  name: string;
  nameParent: string;
  placeCode: string;
  adminLevel: AdminLevel;
  firstIssuedDate: string;
  alertLevel: AlertLevel;
  eventName: string;
}
