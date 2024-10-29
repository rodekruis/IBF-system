import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MapService } from './map.service';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { IbfLayerLabel, IbfLayerName, IbfLayerType } from '../types/ibf-layer';

const MOCK_LAYERS = [
  {
    type: IbfLayerType.point,
    name: IbfLayerName.waterpointsInternal,
    label: IbfLayerLabel.waterpoints,
    description: 'waterpointsInternal',
    active: true,
    show: true,
    viewCenter: false,
    order: 1,
  },
  {
    type: IbfLayerType.point,
    name: IbfLayerName.redCrossBranches,
    label: IbfLayerLabel.redCrossBranches,
    description: 'redCrossBranches',
    active: true,
    show: true,
    viewCenter: false,
    order: 2,
  },
];

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLayerByName', () => {
    beforeEach(() => {
      service['layers'] = MOCK_LAYERS;
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
});
