import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';

export interface AdminAreaAssertion {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
  featureCount: number;
  placeCodeRegex: RegExp;
}

export const adminAreasAssertions: AdminAreaAssertion[] = [
  {
    countryCodeISO3: 'UGA',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 4,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'UGA',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 135,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'UGA',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 203,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'UGA',
    adminLevel: AdminLevel.adminLevel4,
    featureCount: 1520,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'ZMB',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 10,
    placeCodeRegex: /^ZM/,
  },
  {
    countryCodeISO3: 'ZMB',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 115,
    placeCodeRegex: /^ZM/,
  },
  {
    countryCodeISO3: 'ZMB',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 1358,
    placeCodeRegex: /^(?:ZM\d*|[01]\d{8})$/, // FIX: set to /^ZM/ after data is fixed
  },
  {
    countryCodeISO3: 'MWI',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 3,
    placeCodeRegex: /^MW/,
  },
  {
    countryCodeISO3: 'MWI',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 32,
    placeCodeRegex: /^MW/,
  },
  {
    countryCodeISO3: 'MWI',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 367,
    placeCodeRegex: /^MW/,
  },
  {
    countryCodeISO3: 'SSD',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 10,
    placeCodeRegex: /^SS/,
  },
  {
    countryCodeISO3: 'SSD',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 79,
    placeCodeRegex: /^SS/,
  },
  {
    countryCodeISO3: 'SSD',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 511,
    placeCodeRegex: /^SS/,
  },
  {
    countryCodeISO3: 'KEN',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 47,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'KEN',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 290,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'KEN',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 1450,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'ETH',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 12,
    placeCodeRegex: /^ET/,
  },
  {
    countryCodeISO3: 'ETH',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 92,
    placeCodeRegex: /^ET/,
  },
  {
    countryCodeISO3: 'ETH',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 1082,
    placeCodeRegex: /^ET/,
  },
  {
    countryCodeISO3: 'PHL',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 17,
    placeCodeRegex: /^PH/,
  },
  {
    countryCodeISO3: 'PHL',
    adminLevel: AdminLevel.adminLevel2,
    featureCount: 87,
    placeCodeRegex: /^PH/,
  },
  {
    countryCodeISO3: 'PHL',
    adminLevel: AdminLevel.adminLevel3,
    featureCount: 1647,
    placeCodeRegex: /^PH/,
  },
  {
    countryCodeISO3: 'ZWE',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 10,
    placeCodeRegex: /^ZW/,
  },
  {
    countryCodeISO3: 'LSO',
    adminLevel: AdminLevel.adminLevel1,
    featureCount: 10,
    placeCodeRegex: /^LS/,
  },
];
