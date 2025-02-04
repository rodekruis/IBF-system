import { AdminLevel } from 'src/app/types/admin-level';
import { TriggeredArea } from 'src/app/types/triggered-area';

export const MOCK_TRIGGEREDAREAS: TriggeredArea[] = [
  {
    mainExposureValue: 1,
    triggerValue: 1,
    displayName: 'Guba',
    eapActions: [],
    eventPlaceCodeId: '',
    name: 'Guba',
    nameParent: 'Banissa',
    placeCode: 'KE0090400198',
    adminLevel: AdminLevel.adminLevel3,
    startDate: '2024-11-04',
    submitDisabled: false,
  },
  {
    mainExposureValue: 1,
    triggerValue: 1,
    displayName: 'Derkhale',
    eapActions: [],
    eventPlaceCodeId: '',
    name: 'Derkhale',
    nameParent: 'Banissa',
    placeCode: 'KE0090400197',
    adminLevel: AdminLevel.adminLevel3,
    startDate: '2024-11-04',
    submitDisabled: false,
  },
];
