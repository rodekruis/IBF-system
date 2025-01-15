import { CountryDisasterSettings } from 'src/app/models/country.model';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { LeadTime } from 'src/app/types/lead-time';

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

// export const MOCK_COUNTRYDISASTERSETTINGS: CountryDisasterSettings = {
//   disasterType: DisasterTypeKey.floods,
//   adminLevels: [2, 3],
//   defaultAdminLevel: 2,
//   activeLeadTimes: [
//     LeadTime.day0,
//     LeadTime.day1,
//     LeadTime.day2,
//     LeadTime.day3,
//     LeadTime.day4,
//     LeadTime.day5,
//     LeadTime.day6,
//     LeadTime.day7,
//   ],
//   eapLink:
//     'https://kenyaredcross-my.sharepoint.com/:w:/g/personal/saado_halima_redcross_or_ke/ETp6Vml__etKk-C2KAqH4XIBrIJmAMT58mqA_iQlCZtuKw?rtime=FJll0Rbn2Ug',
//   eapAlertClasses: {
//     no: {
//       label: 'No action',
//       color: 'ibf-no-alert-primary',
//       value: 0,
//     },
//     max: {
//       label: 'Trigger issued',
//       color: 'ibf-glofas-trigger',
//       value: 1,
//     },
//   },
//   isEventBased: true,
//   droughtSeasonRegions: null,
//   droughtRegions: {},
//   showMonthlyEapActions: false,
// };
