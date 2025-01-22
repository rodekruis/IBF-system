import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MOCK_COUNTRYDISASTERSETTINGS } from 'src/app/mocks/country-disaster-settings.mock';
import { MOCK_LAYERS } from 'src/app/mocks/ibf-layer.mock';
import { MOCK_TRIGGEREDAREAS } from 'src/app/mocks/triggered-areas.mock';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { MapService } from 'src/app/services/map.service';
import { IbfLayerName } from 'src/app/types/ibf-layer';

describe('MapService', () => {
  let service: MapService;
  let adminLevelService: AdminLevelService;
  const placeCode: PlaceCode = {
    countryCodeISO3: 'KEN',
    placeCode: 'KE0090400198',
    placeCodeName: 'Guba',
    placeCodeParent: {
      countryCodeISO3: 'KEN',
      placeCode: 'KE009040',
      placeCodeName: 'Banissa',
      placeCodeParentName: 'Mandera',
      adminLevel: 2,
    },
    placeCodeParentName: 'Banissa',
    adminLevel: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), TranslateModule.forRoot()],
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
    it('should return the placeCodeParent of the provided placeCode', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      adminLevelService['countryDisasterSettings'] =
        MOCK_COUNTRYDISASTERSETTINGS;

      adminLevelService.adminLevel = 3;

      const expected = 'KE009040';

      expect(service.getPlaceCodeParent(placeCode)).toEqual(expected);
    });
  });

  describe('getAreaByPlaceCode', () => {
    it('should return the triggered area corresponding to the provided placeCode or placeCodeParent', () => {
      service.triggeredAreas = MOCK_TRIGGEREDAREAS;

      const expected = MOCK_TRIGGEREDAREAS[0];

      expect(
        service.getAreaByPlaceCode(
          placeCode.placeCode,
          placeCode.placeCodeParent.placeCode,
        ),
      ).toEqual(expected);
    });
  });
});
