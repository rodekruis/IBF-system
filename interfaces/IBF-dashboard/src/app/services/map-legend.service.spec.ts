import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MapLegendService } from './map-legend.service';

describe('MapLegendService', () => {
  let service: MapLegendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(MapLegendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
