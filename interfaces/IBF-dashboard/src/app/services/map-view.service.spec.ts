import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MapViewService } from './map-view.service';

describe('MapViewService', () => {
  let service: MapViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(MapViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
