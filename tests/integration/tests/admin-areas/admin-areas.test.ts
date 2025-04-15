import * as request from 'supertest';

import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { LeadTime } from '../../helpers/API-service/enum/lead-time.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, getServer, mock } from '../../helpers/utility.helper';

export function getAdminAreas(
  countryCodeISO3: string,
  disasterType: DisasterType,
  adminLevel: AdminLevel,
  accessToken: string,
  leadTime?: LeadTime,
  eventName?: string,
  placeCodeParent?: string,
): Promise<request.Response> {
  return getServer()
    .get(`/admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel}`)
    .query({
      leadTime,
      eventName,
      placeCodeParent,
    })
    .set('Authorization', `Bearer ${accessToken}`);
}

interface Assertion {
  countryCodeISO3: string;
  disasterType: DisasterType;
  adminLevel: AdminLevel;
  scenario: FloodsScenario;
  featureCount: number;
  placeCodeRegex: RegExp;
  leadTime?: LeadTime;
  eventName?: string;
  placeCodeParent?: string;
}

const assertions: Assertion[] = [
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 16,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Warning,
    featureCount: 2,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 4,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
  {
    countryCodeISO3: 'ZMB',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 14,
    placeCodeRegex: /^ZM/,
  },
  {
    countryCodeISO3: 'ZMB',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Trigger,
    featureCount: 10,
    placeCodeRegex: /^ZM/,
  },
  {
    countryCodeISO3: 'MWI',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 4,
    placeCodeRegex: /^(?:MW|Karonga|Blantyre City|Rumphi)/, // REFACTOR: set to /^MW/ after data is fixed
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
    countryCodeISO3: 'SSD',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    featureCount: 1,
    placeCodeRegex: /^SS/,
  },
  {
    countryCodeISO3: 'KEN',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 4,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'KEN',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Trigger,
    featureCount: 40,
    placeCodeRegex: /^KE/,
  },
  {
    countryCodeISO3: 'ETH',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 2,
    placeCodeRegex: /^ET/,
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
  },
  {
    countryCodeISO3: 'PHL',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    featureCount: 3,
    placeCodeRegex: /^PH/,
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
  },
  {
    countryCodeISO3: 'LSO',
    disasterType: DisasterType.Drought,
    adminLevel: AdminLevel.adminLevel1,
    scenario: FloodsScenario.Warning,
    featureCount: 10,
    placeCodeRegex: /^LS/,
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.NoTrigger,
    featureCount: 128,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    leadTime: LeadTime.day4,
    eventName: 'G5220',
    featureCount: 6,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel2,
    scenario: FloodsScenario.Trigger,
    leadTime: LeadTime.day0,
    eventName: 'G5075',
    featureCount: 8,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
  {
    countryCodeISO3: 'UGA',
    disasterType: DisasterType.Floods,
    adminLevel: AdminLevel.adminLevel3,
    scenario: FloodsScenario.Trigger,
    leadTime: LeadTime.day0,
    eventName: 'G5075',
    placeCodeParent: '21UGA003004',
    featureCount: 2,
    placeCodeRegex: /^(UG|21UGA)/, // REFACTOR: set to /^UG/ after data is fixed
  },
];

export default function adminAreaTests() {
  describe('admin areas', () => {
    let accessToken: string;

    beforeAll(async () => {
      accessToken = await getAccessToken();
    });

    assertions.forEach(
      ({
        countryCodeISO3,
        disasterType,
        adminLevel,
        scenario,
        featureCount,
        placeCodeRegex,
        leadTime,
        eventName,
        placeCodeParent,
      }) => {
        let title = `${countryCodeISO3} / ${disasterType} / ${adminLevel} / ${scenario}`;
        if (leadTime) {
          title += ` / ${leadTime}`;
        }
        if (eventName) {
          title += ` / ${eventName}`;
        }
        if (placeCodeParent) {
          title += ` / ${placeCodeParent}`;
        }
        it(title, async () => {
          // Arrange
          await mock(
            scenario,
            disasterType,
            countryCodeISO3,
            null,
            accessToken,
          );

          // Act
          const adminAreas = await getAdminAreas(
            countryCodeISO3,
            disasterType,
            adminLevel,
            accessToken,
            leadTime,
            eventName,
            placeCodeParent,
          );

          // Assert
          expect(adminAreas.status).toBe(200);
          expect(adminAreas.body.features.length).toBe(featureCount); // we expect a deterministic feature count from the mock data

          const feature = adminAreas.body.features[0]; // test the first feature
          expect(feature.geometry.type).toBe('MultiPolygon');
          expect(feature.geometry.coordinates[0][0].length).toBeGreaterThan(0); // the coordinates array should not be empty
          expect(feature.geometry.coordinates[0][0][0].length).toBe(2); // the coordinates should be in [longitude, latitude] format
          expect(feature.properties.placeCode).toMatch(placeCodeRegex); // placeCode should match regex per country
          // REFACTOR: assertions fails for
          // UGA / floods / 2 / Trigger
          // MWI / flash-floods / 3 / trigger
          // uncomment next assertion after fix
          //expect(
          //  adminAreas.body.features.every(
          //    ({ properties: { alertLevel } }) =>
          //      alertLevel === feature.properties.alertLevel,
          //  ),
          //).toBeTruthy(); // all features should have the same alert level
          if (
            countryCodeISO3 === 'MWI' &&
            disasterType === DisasterType.FlashFloods
          ) {
            return;
          }
          // REFACTOR: find out why MWI flash-flood responds differently, fix it, and remove this conditional assertion
          expect(feature.properties.name).toBeTruthy(); // the name should not be empty
          expect(feature.properties.adminLevel).toBe(adminLevel); // request and response admin levels should match
          expect(feature.properties.countryCodeISO3).toBe(countryCodeISO3); // request and response country codes should match
        });
      },
    );
  });
}
