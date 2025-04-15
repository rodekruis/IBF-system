import * as request from 'supertest';

import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getAccessToken, getServer, mock } from '../../helpers/utility.helper';

export function getAdminAreas(
  countryCodeISO3: string,
  disasterType: DisasterType,
  adminLevel: AdminLevel,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .get(`/admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

const assertions = [
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
      }) => {
        it(`should return list of admin areas on GET: ${countryCodeISO3} / ${disasterType} / ${adminLevel} / ${scenario}`, async () => {
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
          );

          // Assert
          expect(adminAreas.status).toBe(200);
          expect(adminAreas.body.features.length).toBe(featureCount); // we expect a deterministic feature count from the mock data

          const feature = adminAreas.body.features[0]; // test the first feature
          expect(feature.geometry.type).toBe('MultiPolygon');
          expect(feature.geometry.coordinates[0][0].length).toBeGreaterThan(0); // the coordinates array should not be empty
          expect(feature.geometry.coordinates[0][0][0].length).toBe(2); // the coordinates should be in [longitude, latitude] format
          expect(feature.properties.placeCode).toMatch(placeCodeRegex); // placeCode should match regex per country
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
