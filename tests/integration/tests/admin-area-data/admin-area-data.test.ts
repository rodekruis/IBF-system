import { getToken } from '../../helpers/utility.helper';
import { mock } from '../../helpers/utility.helper';
import { getAdminAreaData } from './admin-area-data.api';
import { assertions } from './admin-area-data.assertions';

export default function adminAreaDataTests() {
  describe('admin area data', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
      await mock(token);
    });

    assertions.forEach(
      ({ countryCodeISO3, adminLevel, indicator, count, placeCodeRegex }) => {
        let title = 'should return list of admin area data on GET';
        title += ` ${countryCodeISO3} / ${adminLevel} / ${indicator}`;

        it(title, async () => {
          const AdminAreaData = await getAdminAreaData(
            countryCodeISO3,
            adminLevel,
            indicator,
            token,
          );

          // Assert
          expect(AdminAreaData.status).toBe(200);
          expect(AdminAreaData.body.length).toBe(count);

          const randomIndex = Math.floor(
            Math.random() * AdminAreaData.body.length,
          );
          const sample = AdminAreaData.body[randomIndex];
          expect(sample.placeCode).toMatch(placeCodeRegex);
          expect(sample.value).toBeGreaterThanOrEqual(0);
        });
      },
    );
  });
}
