import { CountryDisasterSettings } from 'src/app/models/country.model';
import { AdminLevel } from 'src/app/types/admin-level';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import {
  IbfLayer,
  IbfLayerLabel,
  IbfLayerName,
  IbfLayerType,
} from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';
import { TriggeredArea } from 'src/app/types/triggered-area';

export const MOCK_LAYERS: IbfLayer[] = [
  {
    type: IbfLayerType.point,
    name: IbfLayerName.waterpointsInternal,
    label: IbfLayerLabel.waterpoints,
    description: 'waterpointsInternal',
    active: true,
    show: true,
    viewCenter: false,
    order: 1,
  },
  {
    type: IbfLayerType.point,
    name: IbfLayerName.redCrossBranches,
    label: IbfLayerLabel.redCrossBranches,
    description: 'redCrossBranches',
    active: true,
    show: true,
    viewCenter: false,
    order: 2,
  },
];

export const MOCK_COUNTRYDISASTERSETTINGS: CountryDisasterSettings = {
  disasterType: DisasterTypeKey.floods,
  adminLevels: [2, 3],
  defaultAdminLevel: 2,
  activeLeadTimes: [
    LeadTime.day0,
    LeadTime.day1,
    LeadTime.day2,
    LeadTime.day3,
    LeadTime.day4,
    LeadTime.day5,
    LeadTime.day6,
    LeadTime.day7,
  ],
  eapLink:
    'https://kenyaredcross-my.sharepoint.com/:w:/g/personal/saado_halima_redcross_or_ke/ETp6Vml__etKk-C2KAqH4XIBrIJmAMT58mqA_iQlCZtuKw?rtime=FJll0Rbn2Ug',
  eapAlertClasses: {
    no: {
      label: 'No action',
      color: 'ibf-no-alert-primary',
      value: 0,
    },
    max: {
      label: 'Trigger issued',
      color: 'ibf-glofas-trigger',
      value: 1,
    },
  },
  isEventBased: true,
  droughtSeasonRegions: null,
  droughtRegions: {},
  showMonthlyEapActions: false,
};

export const MOCK_TRIGGEREDAREAS: TriggeredArea[] = [
  {
    actionsValue: 1,
    triggerValue: 1,
    displayName: 'Guba',
    eapActions: [],
    eventPlaceCodeId: '',
    name: 'Guba',
    nameParent: 'Banissa',
    placeCode: 'KE0090400198',
    adminLevel: AdminLevel.adminLevel3,
    startDate: '2024-11-04',
    stopped: false,
    stoppedDate: null,
    submitDisabled: false,
  },
  {
    actionsValue: 1,
    triggerValue: 1,
    displayName: 'Derkhale',
    eapActions: [],
    eventPlaceCodeId: '',
    name: 'Derkhale',
    nameParent: 'Banissa',
    placeCode: 'KE0090400197',
    adminLevel: AdminLevel.adminLevel3,
    startDate: '2024-11-04',
    stopped: false,
    stoppedDate: null,
    submitDisabled: false,
  },
];
