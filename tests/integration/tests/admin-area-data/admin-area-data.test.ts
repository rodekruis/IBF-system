import path from 'path';

import { getToken } from '../../helpers/utility.helper';
import { mock } from '../../helpers/utility.helper';
import {
  getAdminAreaData,
  postAdminAreaDataUploadCsv,
} from './admin-area-data.api';
import {
  getAdminAreaDataAssertions,
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
            countryCodeISO3,
            adminLevel,
            indicator,
            token,
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
          countryCodeISO3,
          adminLevel,
          indicator,
          token,
        );

        expect(adminAreaData.status).toBe(200);

        const adminAreaDataItem = adminAreaData.body.find(
          (item: { placeCode: string; value: number }) =>
            item.placeCode === placeCode,
        );
        expect(adminAreaDataItem.value).toBe(value);
      }
    });
  });
}
