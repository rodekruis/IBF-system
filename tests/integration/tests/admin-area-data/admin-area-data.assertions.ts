import { AdminAreaDataIndicator } from '../../fixtures/indicators.enum';
import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';

interface GetAdminAreaDataAssertion {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
  indicator: AdminAreaDataIndicator;
  count: number;
  placeCodeRegex: RegExp;
}

export const getAdminAreaDataAssertions: GetAdminAreaDataAssertion[] = [
  {
    countryCodeISO3: 'UGA',
    adminLevel: AdminLevel.adminLevel2,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 135,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'ZMB',
    adminLevel: AdminLevel.adminLevel2,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 115,
    placeCodeRegex: /^ZM/,
  },
  {
    countryCodeISO3: 'ZMB',
    adminLevel: AdminLevel.adminLevel1,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 10,
    placeCodeRegex: /^ZM/,
  },
  {
    countryCodeISO3: 'MWI',
    adminLevel: AdminLevel.adminLevel3,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 370,
    placeCodeRegex: /^MW/,
  },
  {
    countryCodeISO3: 'SSD',
    adminLevel: AdminLevel.adminLevel3,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 511,
    placeCodeRegex: /^SS/,
  },
  {
    countryCodeISO3: 'KEN',
    adminLevel: AdminLevel.adminLevel2,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 290,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'KEN',
    adminLevel: AdminLevel.adminLevel1,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 47,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'ETH',
    adminLevel: AdminLevel.adminLevel2,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 92,
    placeCodeRegex: /^ET/,
  },
  {
    countryCodeISO3: 'ETH',
    adminLevel: AdminLevel.adminLevel3,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 1040,
    placeCodeRegex: /^ET/,
  },
  {
    countryCodeISO3: 'PHL',
    adminLevel: AdminLevel.adminLevel2,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 87,
    placeCodeRegex: /^PH/,
  },
  {
    countryCodeISO3: 'PHL',
    adminLevel: AdminLevel.adminLevel3,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 1647,
    placeCodeRegex: /^PH/,
  },
  {
    countryCodeISO3: 'ZWE',
    adminLevel: AdminLevel.adminLevel1,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 10,
    placeCodeRegex: /^ZW/,
  },
  {
    countryCodeISO3: 'LSO',
    adminLevel: AdminLevel.adminLevel1,
    indicator: AdminAreaDataIndicator.populationTotal,
    count: 10,
    placeCodeRegex: /^LS/,
  },
];

interface PostAdminAreaDataAssertion {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
  indicator: AdminAreaDataIndicator;
  placeCode: string;
  value: number;
}

// assertions based on fixtures/admin-area-data.csv
export const postAdminAreaDataUploadCsvAssertions: PostAdminAreaDataAssertion[] =
  [
    {
      countryCodeISO3: 'ETH',
      adminLevel: AdminLevel.adminLevel1,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'ET14',
      value: 1000,
    },
    {
      countryCodeISO3: 'KEN',
      adminLevel: AdminLevel.adminLevel1,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'KE036',
      value: 1001,
    },
    {
      countryCodeISO3: 'LSO',
      adminLevel: AdminLevel.adminLevel1,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'LSC',
      value: 1011,
    },
    {
      countryCodeISO3: 'MWI',
      adminLevel: AdminLevel.adminLevel2,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'MW310',
      value: 2000,
    },
    {
      countryCodeISO3: 'PHL',
      adminLevel: AdminLevel.adminLevel3,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'PH012813000',
      value: 3003,
    },
    {
      countryCodeISO3: 'PHL',
      adminLevel: AdminLevel.adminLevel3,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'PH012814000',
      value: 3333,
    },
    {
      countryCodeISO3: 'SSD',
      adminLevel: AdminLevel.adminLevel3,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'SS010109',
      value: 3033,
    },
    {
      countryCodeISO3: 'UGA',
      adminLevel: AdminLevel.adminLevel2,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'UG2033',
      value: 2002,
    },
    {
      countryCodeISO3: 'ZMB',
      adminLevel: AdminLevel.adminLevel2,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'ZM8005',
      value: 2022,
    },
    {
      countryCodeISO3: 'ZWE',
      adminLevel: AdminLevel.adminLevel1,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'ZW17',
      value: 1111,
    },
  ];

export const postAdminAreaDataUploadJsonAssertions: PostAdminAreaDataAssertion[] =
  [
    {
      countryCodeISO3: 'ETH',
      adminLevel: AdminLevel.adminLevel1,
      indicator: AdminAreaDataIndicator.populationTotal,
      placeCode: 'ET14',
      value: 505,
    },
  ];
