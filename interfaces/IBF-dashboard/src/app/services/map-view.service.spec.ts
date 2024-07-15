import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MapViewService } from './map-view.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MapViewService', () => {
  let service: MapViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(MapViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
