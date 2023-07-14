import { TestBed } from '@angular/core/testing';

import { MapLegendService } from './map-legend.service';

describe('MapLegendService', () => {
  let service: MapLegendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapLegendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
