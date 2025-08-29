import { AlertLevel } from 'src/app/services/event.service';
import { AdminLevel } from 'src/app/types/admin-level';
import { AlertArea } from 'src/app/types/alert-area';

export const MOCK_ALERT_AREAS: AlertArea[] = [
  {
    mainExposureValue: 1,
    forecastSeverity: 1,
    forecastTrigger: true,
    displayName: 'Guba',
    eapActions: [],
    eventPlaceCodeId: '',
    name: 'Guba',
    nameParent: 'Banissa',
    placeCode: 'KE0090400198',
    adminLevel: AdminLevel.adminLevel3,
    firstIssuedDate: '2025-02-21T12:38:48.546Z',
    alertLevel: AlertLevel.TRIGGER,
    eventName: 'Flood',
  },
  {
    mainExposureValue: 1,
    forecastSeverity: 1,
    forecastTrigger: true,
    displayName: 'Derkhale',
    eapActions: [],
    eventPlaceCodeId: '',
    name: 'Derkhale',
    nameParent: 'Banissa',
    placeCode: 'KE0090400197',
    adminLevel: AdminLevel.adminLevel3,
    firstIssuedDate: '2025-02-21T12:38:48.546Z',
    alertLevel: AlertLevel.TRIGGER,
    eventName: 'Flood',
  },
];
