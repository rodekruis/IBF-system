import { TestBed } from '@angular/core/testing';
import { MapViewService } from './map-view.service';

describe('MapViewService', () => {
  let service: MapViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
