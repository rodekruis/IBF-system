import { CountryDto } from '../helpers/API-service/dto/create-country.dto';

export const countryData: CountryDto[] = [
  {
    countryCodeISO3: 'MWI',
    countryName: 'Malawi',
    disasterTypes: ['floods', 'flash-floods'],
    countryDisasterSettings: [
      {
        disasterType: 'floods',
        adminLevels: [3],
        defaultAdminLevel: 3,
        activeLeadTimes: [
          '0-day',
          '1-day',
          '2-day',
          '3-day',
          '4-day',
          '5-day',
          '6-day',
          '7-day',
        ],
        eapLink:
          'https://510ibfsystem.blob.core.windows.net/about-trigger/MWI-EAP-document.pdf',
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
      },
      {
        disasterType: 'flash-floods',
        adminLevels: [3],
        defaultAdminLevel: 3,
        activeLeadTimes: [
          '0-hour',
          '1-hour',
          '2-hour',
          '3-hour',
          '4-hour',
          '5-hour',
          '6-hour',
          '7-hour',
          '8-hour',
          '9-hour',
          '10-hour',
          '11-hour',
          '12-hour',
          '15-hour',
          '18-hour',
          '21-hour',
          '24-hour',
          '48-hour',
        ],
        eapLink:
          'https://510ibfsystem.blob.core.windows.net/about-trigger/MWI-flashfloods-about.pdf',
        enableEarlyActions: false,
        enableStopTrigger: false,
        isEventBased: true,
      },
    ],
    adminRegionLabels: {
      '1': {
        singular: 'Region',
        plural: 'Regions',
      },
      '2': {
        singular: 'District',
        plural: 'Districts',
      },
      '3': {
        singular: 'Traditional Authority',
        plural: 'Traditional Authorities',
      },
    },
    countryLogos: {
      floods: ['MWI-mrcs.png', 'ZWE-DanishRedCross.png'],
      'flash-floods': ['MWI-government.jpeg'],
    },
    countryBoundingBox: {
      type: 'Polygon',
      coordinates: [
        [
          [35.7719047381, -16.8012997372],
          [35.7719047381, -9.23059905359],
          [32.6881653175, -9.23059905359],
          [32.6881653175, -16.8012997372],
          [35.7719047381, -16.8012997372],
        ],
      ],
    },
  },
];
