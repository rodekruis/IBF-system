import { getToken, mock } from '../../helpers/utility.helper';
import { getAdminAreas } from './admin-areas.api';
import { adminAreasAssertions } from './admin-areas.assertions';

export default function adminAreaTests() {
  describe('admin areas', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();

      await mock(token);
    });

    adminAreasAssertions.forEach(
      ({ countryCodeISO3, adminLevel, featureCount, placeCodeRegex }) => {
        let title = 'should return list of admin areas on GET';
        title += ` /admin-areas/${countryCodeISO3}/${adminLevel}`;

        it(title, async () => {
          // act
          const adminAreas = await getAdminAreas(
            countryCodeISO3,
            adminLevel,
            token,
          );

          // assert
          expect(adminAreas.status).toBe(200);
          expect(adminAreas.body.features.length).toBe(featureCount); // we expect a deterministic feature count from the mock data

          const feature = adminAreas.body.features[0]; // test the first feature
          expect(['Polygon', 'MultiPolygon']).toContain(feature.geometry.type);
          expect(feature.geometry.coordinates[0][0].length).toBeGreaterThan(0); // the coordinates array should not be empty
          if (feature.geometry.type === 'Polygon') {
            expect(feature.geometry.coordinates[0][0].length).toBe(2); // the coordinates should be in [longitude, latitude] format
          } else if (feature.geometry.type === 'MultiPolygon') {
            expect(feature.geometry.coordinates[0][0][0].length).toBe(2); // the coordinates should be in [longitude, latitude] format
          }
          expect(feature.properties[`adm${adminLevel}_pcode`]).toMatch(
            placeCodeRegex,
          ); // pcode should match regex per country
          expect(feature.properties[`adm${adminLevel}_en`]).toBeTruthy(); // en should not be an empty name

          if (adminLevel > 1) {
            expect(feature.properties[`adm${adminLevel - 1}_pcode`]).toMatch(
              placeCodeRegex,
            ); // parent pcode should match regex per country
            expect(feature.properties[`adm${adminLevel - 1}_en`]).toBeTruthy(); // parent en should not be an empty name
          } else {
            expect(feature.properties[`adm${adminLevel - 1}_pcode`]).toBe(
              undefined,
            ); // parent pcode should not exist for adminLevel 1
            expect(feature.properties[`adm${adminLevel - 1}_en`]).toBe(
              undefined,
            ); // parent en should not exist for adminLevel 1
          }
        });
      },
    );
  });
}
