import path from 'path';

import { AdminAreaDataIndicator } from '../../fixtures/indicators.enum';
import { AdminLevel } from '../../helpers/API-service/enum/admin-level.enum';
import { getToken } from '../../helpers/utility.helper';
import { mock } from '../../helpers/utility.helper';
import {
  AdminAreaDatum,
  getAdminAreaData,
  postAdminAreaData,
  postAdminAreaDataUploadCsv,
} from './admin-area-data.api';
import {
  getAdminAreaDataAssertions,
  postAdminAreaDataAssertions,
  postAdminAreaDataUploadCsvAssertions,
} from './admin-area-data.assertions';

export default function adminAreaDataTests() {
  describe('admin area data', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
      await mock(token);
    });

    getAdminAreaDataAssertions.forEach(
      ({ countryCodeISO3, adminLevel, indicator, count, placeCodeRegex }) => {
        let title = 'should return list of admin area data on GET';
        title += ` ${countryCodeISO3} / ${adminLevel} / ${indicator}`;

        it(title, async () => {
          // act
          const adminAreaData = await getAdminAreaData(
            token,
            countryCodeISO3,
            adminLevel,
            indicator,
          );

          // assert
          expect(adminAreaData.status).toBe(200);
          expect(adminAreaData.body.length).toBe(count);

          const randomIndex = Math.floor(
            Math.random() * adminAreaData.body.length,
          );
          const sample = adminAreaData.body[randomIndex];
          expect(sample.placeCode).toMatch(placeCodeRegex);
          expect(sample.value).toBeGreaterThanOrEqual(0);
        });
      },
    );

    it('should update admin area data on POST', async () => {
      // arrange
      const countryCodeISO3 = 'ETH';
      const adminLevel = AdminLevel.adminLevel1;
      const indicator = AdminAreaDataIndicator.populationTotal;
      const adminAreaData = [{ placeCode: 'ET14', amount: 42 }];

      // act
      const response = await postAdminAreaData(
        token,
        countryCodeISO3,
        adminLevel,
        indicator,
        adminAreaData,
      );

      // assert
      expect(response.status).toBe(201);

      for (const assertionIndex in postAdminAreaDataAssertions) {
        const { countryCodeISO3, adminLevel, indicator, placeCode, value } =
          postAdminAreaDataAssertions[assertionIndex];

        const adminAreaData = await getAdminAreaData(
          token,
          countryCodeISO3,
          adminLevel,
          indicator,
        );

        expect(adminAreaData.status).toBe(200);

        const adminAreaDatum = adminAreaData.body.find(
          (adminAreaDatum: AdminAreaDatum) =>
            adminAreaDatum.placeCode === placeCode,
        );
        expect(adminAreaDatum.value).toBe(value);
      }
    });

    it('should upload admin area data from CSV', async () => {
      // arrange
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'fixtures',
        'admin-area-data.csv',
      );

      // act
      const response = await postAdminAreaDataUploadCsv(token, filePath);

      // assert
      expect(response.status).toBe(201);

      for (const assertionIndex in postAdminAreaDataUploadCsvAssertions) {
        const { countryCodeISO3, adminLevel, indicator, placeCode, value } =
          postAdminAreaDataUploadCsvAssertions[assertionIndex];

        const adminAreaData = await getAdminAreaData(
          token,
          countryCodeISO3,
          adminLevel,
          indicator,
        );

        expect(adminAreaData.status).toBe(200);

        const adminAreaDatum = adminAreaData.body.find(
          (item: AdminAreaDatum) => item.placeCode === placeCode,
        );
        expect(adminAreaDatum.value).toBe(value);
      }
    });
  });
}
