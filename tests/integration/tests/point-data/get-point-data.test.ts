import { Feature } from 'geojson';

import { PointIndicator } from '../../fixtures/indicators.enum';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FlashFloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { getToken } from '../../helpers/utility.helper';
import { mock } from '../../helpers/utility.helper';
import { getPointData } from './point-data.api';

export default function getPointDataTests() {
  describe('get point data', () => {
    let token: string;

    beforeAll(async () => {
      token = await getToken();
    });

    const countryCodeISO3 = 'MWI';
    const disasterType = DisasterType.FlashFloods;

    it('should successfully get point data on exposable assets', async () => {
      // Arrange
      await mock(
        token,
        FlashFloodsScenario.Trigger,
        disasterType,
        countryCodeISO3,
        new Date(),
      );
      const pointAssetLayers = [
        PointIndicator.schools,
        PointIndicator.healthSites,
        PointIndicator.waterpoints,
      ];

      for (const pointDataLayer of pointAssetLayers) {
        // act
        const pointDataResult = await getPointData(
          countryCodeISO3,
          pointDataLayer,
          disasterType,
          token,
        );
        const pointData = pointDataResult.body;

        // assert
        expect(pointDataResult.status).toBe(200);
        expect(pointData.type).toBe('FeatureCollection');
        expect(pointData.features.length).toBeGreaterThan(0);
        expect(pointData.features[0].geometry.type).toBe('Point');
        // test if there is at least one exposed asset
        const hasExposedFeature = pointData.features.some(
          (feature: Feature) =>
            feature.properties &&
            feature.properties.dynamicData?.exposure === 'true',
        );
        expect(hasExposedFeature).toBe(true);
      }
    });
  });
}
