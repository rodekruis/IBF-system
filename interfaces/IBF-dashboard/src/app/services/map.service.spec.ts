import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { MapService } from 'src/app/services/map.service';
import {
  MOCK_COUNTRYDISASTERSETTINGS,
  MOCK_LAYERS,
  MOCK_PLACECODE,
  MOCK_TRIGGEREDAREAS as MOCK_TRIGGEREDAREAS,
} from 'src/app/services/map.service.spec.helper';
import { IbfLayerName } from 'src/app/types/ibf-layer';

describe('MapService', () => {
  let service: MapService;
  let adminLevelService: AdminLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MapService);
    adminLevelService = TestBed.inject(AdminLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLayerByName', () => {
    beforeEach(() => {
      service.layers = MOCK_LAYERS;
    });

    it('should get a layer from its name', () => {
      const layerName = IbfLayerName.waterpointsInternal;

      const expected = MOCK_LAYERS[0];

      expect(service.getLayerByName(layerName)).toEqual(expected);
    });

    it('should be undefined if no layer has the provided name', () => {
      const layerName = IbfLayerName.gauges;

      expect(service.getLayerByName(layerName)).toBeUndefined();
    });
  });

  describe('getPlaceCodeParent', () => {
    it('should return the palceCodeParent of the provided placeCode', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      adminLevelService['countryDisasterSettings'] =
        MOCK_COUNTRYDISASTERSETTINGS;
      // eslint-disable-next-line @typescript-eslint/dot-notation
      adminLevelService['adminLevel'] = 3;

      expect(service.getPlaceCodeParent(MOCK_PLACECODE)).toEqual(
        MOCK_PLACECODE.placeCodeParent.placeCode,
      );
    });
  });

  describe('getAreaByPlaceCode', () => {
    it('should return the triggered area corresponding to the provided placeCode or placeCodeParent', () => {
      service.triggeredAreas = MOCK_TRIGGEREDAREAS;

      expect(
        service.getAreaByPlaceCode(
          MOCK_PLACECODE.placeCode,
          MOCK_PLACECODE.placeCodeParent.placeCode,
        ),
      ).toEqual(MOCK_TRIGGEREDAREAS[0]);
    });
  });
});
