import { EVENT_AREA_DISASTER_TYPES } from '../../helpers/API-service/enum/disaster-type.enum';
import { getToken, mock } from '../../helpers/utility.helper';
import { getEventAdminAreas } from './admin-areas.api';
import { eventAdminAreasAssertions } from './event-admin-areas.assertions';

export default function eventAdminAreaTests() {
  describe('event admin areas', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    eventAdminAreasAssertions.forEach(
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
        uploadDate,
      }) => {
        let title = 'should return list of admin areas on GET';
        title += ` /admin-areas/${countryCodeISO3}/${disasterType}/${adminLevel} in ${scenario}`;
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
            token,
            scenario,
            disasterType,
            countryCodeISO3,
            uploadDate,
          );

          // Act
          const adminAreas = await getEventAdminAreas(
            countryCodeISO3,
            disasterType,
            adminLevel,
            token,
            leadTime,
            eventName,
            placeCodeParent,
          );

          // Assert
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
          expect(feature.properties.placeCode).toMatch(placeCodeRegex); // placeCode should match regex per country
          if (eventName) {
            // all admin areas in an event should have the same alert level
            expect(
              adminAreas.body.features.every(
                ({ properties: { alertLevel } }) =>
                  alertLevel === feature.properties.alertLevel,
              ),
            ).toBeTruthy(); // all features should have the same alert level
          }
          expect(feature.properties.name).toBeTruthy(); // the name should not be empty
          expect(feature.properties.countryCodeISO3).toBe(countryCodeISO3); // request and response country codes should match

          // REFACTOR: flash floods & floods in National View returns event-areas instead of admin-areas, which do not have an adminLevel. Align response formats better in future.
          if (EVENT_AREA_DISASTER_TYPES.includes(disasterType) && !eventName) {
            return;
          }
          expect(feature.properties.adminLevel).toBe(adminLevel); // request and response admin levels should match
        });
      },
    );
  });
}
