import { AdminAreaDataIndicator } from '../../fixtures/indicators.enum';
import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';

interface Assertion {
  countryCodeISO3: string;
  adminLevel: AdminLevel;
  indicator: AdminAreaDataIndicator;
  count: number;
  placeCodeRegex: RegExp;
}

export const assertions: Assertion[] = [
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
