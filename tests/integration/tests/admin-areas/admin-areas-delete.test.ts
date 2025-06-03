import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getToken, mock } from '../../helpers/utility.helper';
import { deleteAdminAreas } from './admin-areas.api';

export function adminAreaDeleteTests() {
  describe('admin areas delete', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'UGA';
    const adminLevel = 2;

    it('should forbid on DELETE /admin-areas with active events', async () => {
      // arrange
      const placeCodesToDelete = ['UG2037'];
      await mock(
        token,
        FloodsScenario.Trigger,
        DisasterType.Floods,
        countryCodeISO3,
      );

      // act
      const result = await deleteAdminAreas(
        countryCodeISO3,
        adminLevel,
        token,
        placeCodesToDelete,
      );

      // assert
      expect(result.status).toBe(403); // should be forbidden
      expect(result.body.message).toContain(
        'Cannot delete admin areas with active events',
      );
      expect(result.body.message).toContain(placeCodesToDelete[0]); // should mention the problematic placeCode
    });

    it('should allow DELETE /admin-areas with no active events', async () => {
      // arrange
      const placeCodesToDelete = ['UG1001'];
      await mock(
        token,
        FloodsScenario.Trigger,
        DisasterType.Floods,
        countryCodeISO3,
      );

      // act
      const result = await deleteAdminAreas(
        countryCodeISO3,
        adminLevel,
        token,
        placeCodesToDelete,
      );

      // assert
      expect(result.status).toBe(202);
      expect(result.body.affected).toBe(placeCodesToDelete.length);
    });
  });
}
