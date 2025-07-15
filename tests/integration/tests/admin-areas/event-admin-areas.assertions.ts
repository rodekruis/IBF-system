import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { LeadTime } from '../../helpers/API-service/enum/lead-time.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { AdminAreaAssertion } from './admin-areas.assertions';

interface EventAdminAreaAssertion extends AdminAreaAssertion {
  disasterType: DisasterType;
  scenario: FloodsScenario;
  leadTime?: LeadTime;
  eventName?: string;
  placeCodeParent?: string;
  uploadDate?: Date;
}

export const eventAdminAreasAssertions: EventAdminAreaAssertion[] = [
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 3,
    placeCodeRegex: /^(?:UG|G)/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Warning,
    featureCount: 1,
    placeCodeRegex: /^(?:UG|G)/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 4,
    placeCodeRegex: /^UG/,
    uploadDate: new Date(new Date().getFullYear(), 4, 2), // Fix to date in May for stable response
  },
  {
    countryCodeISO3: 'ZMB',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 2,
    placeCodeRegex: /^(?:ZM|G)/,
  },
  {
    countryCodeISO3: 'ZMB',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Trigger,
    featureCount: 10,
    placeCodeRegex: /^ZM/,
    uploadDate: new Date(new Date().getFullYear(), 4, 2), // Fix to date in May for stable response
  },
  {
    countryCodeISO3: 'MWI',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 1,
    placeCodeRegex: /^(?:MW|G)/, // REFACTOR: set to /^MW/ after data is fixed
  },
  {
    countryCodeISO3: 'MWI',
    disasterType: DisasterType.FlashFloods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 3,
    placeCodeRegex: /^(?:MW|Karonga|Blantyre City|Rumphi)/, // REFACTOR: set to /^MW/ after data is fixed
  },
  {
    countryCodeISO3: 'MWI',
    disasterType: DisasterType.FlashFloods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    eventName: 'Karonga',
    featureCount: 7,
    placeCodeRegex: /^(?:MW|Karonga|Blantyre City|Rumphi)/, // REFACTOR: set to /^MW/ after data is fixed
  },
  {
    countryCodeISO3: 'SSD',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 1,
    placeCodeRegex: /^(?:SS|G)/,
  },
  {
    countryCodeISO3: 'KEN',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 1,
    placeCodeRegex: /^(?:KE|G)/,
  },
  {
    countryCodeISO3: 'KEN',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Trigger,
    featureCount: 40,
    placeCodeRegex: /^KE/,
    uploadDate: new Date(new Date().getFullYear(), 4, 2), // Fix to date in May for stable response
  },
  {
    countryCodeISO3: 'ETH',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 1,
    placeCodeRegex: /^(?:ET|G)/,
  },
  {
    countryCodeISO3: 'ETH',
    disasterType: DisasterType.Malaria,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 27,
    placeCodeRegex: /^ET/,
  },
  {
    countryCodeISO3: 'ETH',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 190,
    placeCodeRegex: /^ET/,
    uploadDate: new Date(new Date().getFullYear(), 4, 2), // Fix to date in May for stable response
  },
  {
    countryCodeISO3: 'PHL',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 2,
    placeCodeRegex: /^(?:PH|G)/,
  },
  {
    countryCodeISO3: 'PHL',
    disasterType: DisasterType.Typhoon,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 60,
    placeCodeRegex: /^PH/,
  },
  {
    countryCodeISO3: 'ZWE',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Trigger,
    featureCount: 3,
    placeCodeRegex: /^ZW/,
    uploadDate: new Date(new Date().getFullYear(), 4, 2), // Fix to date in May for stable response
  },
  {
    countryCodeISO3: 'LSO',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Warning,
    featureCount: 6,
    placeCodeRegex: /^LS/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.NoTrigger,
    featureCount: 135,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    leadTime: LeadTime.day4,
    eventName: 'G5220',
    featureCount: 6,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    leadTime: LeadTime.day0,
    eventName: 'G5075',
    featureCount: 8,
    placeCodeRegex: /^UG/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    leadTime: LeadTime.day0,
    eventName: 'G5075',
    placeCodeParent: 'UG2037',
    featureCount: 1,
    placeCodeRegex: /^UG/,
  },
];
