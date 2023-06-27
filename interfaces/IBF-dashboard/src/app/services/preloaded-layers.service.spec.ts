import { TestBed } from '@angular/core/testing';

import { PreloadedLayersService } from './preloaded-layers.service';

describe('PreloadedLayersService', () => {
  let service: PreloadedLayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreloadedLayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
