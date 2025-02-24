// REFACTOR: We will need to set this up differently going forward, not using enums for this.
import ugandaFloodsNoTrigger from './uganda-floods-no-trigger.json';
export enum NoTriggerDataSet {
  NoTriggerScenario = 'no-trigger',
  DisasterType = 'floods', // Only 'floods' works for now
  CountryCode = 'KEN',
  CountryName = 'Kenya',
  UserMail = 'kenya@redcross.nl',
  UserPassword = 'password',
  firstName = 'Kenya',
  lastName = 'Manager',
}

const UgandaFloodNoTriggerDataSetJSON = {
  scenario: 'no-trigger',
  disasterType: 'floods',
  countryCode: 'KEN',
  countryName: 'Kenya',
  userMail: 'kenya@redcross.nl',
  userPassword: 'password',
  firstName: 'Kenya',
  lastName: 'Manager',
  mapLayers: ['glofas_stations'],
  aggregatesComponent: {
    headerText: 'National View 0 Predicted Flood(s)',
    indicators: [
      {
        name: 'population_exposed',
        label: 'Exposed population',
        popover: {
          description: 'This is the exposed population',
          source: {
            label: 'High Resolution Settlement Layer (HRSL)',
            url: 'https://www.ciesin.columbia.edu/data/hrsl/',
          },
        },
      },
      { name: 'population_total', label: 'Total population' },
      {
        name: 'population_female_headed_household',
        label: 'Female-headed household',
      },
      {
        name: 'population_under_eight',
        label: 'Population under 8',
      },
      {
        name: 'population_over_sixty_five',
        label: 'Population over 65',
      },
    ],
  },
};

const UgandaDroughtNoTriggerDataSetJSON = {
  scenario: 'no-trigger',
  disasterType: 'drought',
  countryCode: 'UGA',
  countryName: 'Uganda',
  userMail: 'uganda@redcross.nl',
  userPassword: 'password',
  firstName: 'Uganda',
  lastName: 'Manager',
  mapLayers: [],
  aggregatesComponent: {
    headerText: 'National View 0 Predicted Drought(s)',
    indicators: [
      {
        name: 'population_exposed',
        label: 'Exposed population',
        popoverText: 'This is the exposed population DROUGHT',
      },
      { name: 'population_total', label: 'Total population' },
    ],
  },
};

export const TestScenarios = {
  'KEN-floods-no-trigger': UgandaFloodNoTriggerDataSetJSON,
  'UGA-floods-no-trigger': ugandaFloodsNoTrigger,
  'UGA-floods-trigger': {},
  'UGA-drought-no-trigger': UgandaDroughtNoTriggerDataSetJSON,
  'UGA-drought-trigger': {},
};

export enum TriggerDataSet {
  TriggerScenario = 'trigger',
  DisasterType = 'floods', // Only 'floods' works for now
  CountryCode = 'KEN',
  CountryName = 'Kenya',
  UserMail = 'kenya@redcross.nl',
  UserPassword = 'password',
  firstName = 'Kenya',
  lastName = 'Manager',
}
// For now there are only floods
export const DISASTER_TYPES_WITH_INACTIVE_TIMELINE = ['floods', 'flash-floods']; // 'droughts' is not yet implemented but may be added in the future
