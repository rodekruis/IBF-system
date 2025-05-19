import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { FlashFloodsScenario } from '../../helpers/API-service/enum/mock-scenario.enum';
import { PointDataEnum } from '../../helpers/API-service/enum/point-data.enum';
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
        PointDataEnum.schools,
        PointDataEnum.healthSites,
        PointDataEnum.waterpointsInternal,
      ];

      for (const pointDataLayer of pointAssetLayers) {
        // Act
        const pointDataResult = await getPointData(
          countryCodeISO3,
          pointDataLayer,
          disasterType,
          token,
        );
        const pointData = pointDataResult.body;

        // Assert
        expect(pointDataResult.status).toBe(200);
        expect(pointData.type).toBe('FeatureCollection');
        expect(pointData.features.length).toBeGreaterThan(0);
        expect(pointData.features[0].geometry.type).toBe('Point');
        // Test if there is at least one exposed asset.
        const hasExposedFeature = pointData.features.some(
          (feature) =>
            feature.properties &&
            feature.properties.dynamicData?.exposure === 'true',
        );
        expect(hasExposedFeature).toBe(true);
      }
    });
  });
}
