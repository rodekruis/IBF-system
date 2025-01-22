import { MOCK_COUNTRYDISASTERSETTINGS } from 'src/app/mocks/country-disaster-settings.mock';
import { MOCK_DISASTERTYPE } from 'src/app/mocks/disaster-type.mock';
import { Country } from 'src/app/models/country.model';

export const MOCK_COUNTRY: Country = {
  countryCodeISO3: 'KEN',
  countryDisasterSettings: [MOCK_COUNTRYDISASTERSETTINGS],
  countryName: 'Kenya',
  adminRegionLabels: {
    '1': {
      singular: 'County',
      plural: 'Counties',
    },
    '2': {
      singular: 'Subcounty',
      plural: 'Subcounties',
    },
    '3': {
      singular: 'Ward',
      plural: 'Wards',
    },
  },
  countryLogos: {
    floods: ['KEN-krcs.png'],
    drought: ['KEN-krcs.png'],
  },
  disasterTypes: [MOCK_DISASTERTYPE],
  notificationInfo: {
    linkPdf: 'https://example.com',
    linkVideo: 'https://example.com',
  },
};
