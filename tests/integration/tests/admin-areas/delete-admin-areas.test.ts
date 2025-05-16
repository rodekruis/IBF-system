import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getToken, mock } from '../../helpers/utility.helper';
import { deleteAdminAreas } from './admin-areas.api';

/**
 * Integration tests for the admin area deletion functionality
 * Following Azure best practices for testing security-critical operations
 */
export function adminAreaDeleteTests() {
  describe('DELETE /admin-areas', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'UGA';
    const adminLevel = 2;

    it('should return 403 Forbidden when trying to delete admin areas with active events', async () => {
      // Arrange
      const placeCodesToDelete = ['UG2037'];
      await mock(
        token,
        FloodsScenario.Trigger,
        DisasterType.Floods,
        countryCodeISO3,
      );

      // Act
      const result = await deleteAdminAreas(
        countryCodeISO3,
        adminLevel,
        token,
        placeCodesToDelete,
      );

      // Assert
      expect(result.status).toBe(403); // Should be forbidden
      expect(result.body.message).toContain(
        'Cannot delete admin areas with active events',
      );
      expect(result.body.message).toContain(placeCodesToDelete[0]); // Should mention the problematic placeCode
    });

    // describe('Scenario: Successful admin area deletion', () => {
    it('should successfully delete admin areas with no active events', async () => {
      // Arrange
      const placeCodesToDelete = ['UG1001'];
      await mock(
        token,
        FloodsScenario.Trigger,
        DisasterType.Floods,
        countryCodeISO3,
      );

      // Act
      const result = await deleteAdminAreas(
        countryCodeISO3,
        adminLevel,
        token,
        placeCodesToDelete,
      );

      // Assert
      expect(result.status).toBe(202);
      expect(result.body.affected).toBe(placeCodesToDelete.length);
    });
  });
}
