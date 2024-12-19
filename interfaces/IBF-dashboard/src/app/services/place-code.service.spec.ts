import { TestBed } from '@angular/core/testing';
import { PlaceCodeService } from 'src/app/services/place-code.service';

describe('PlaceCodeService', () => {
  let service: PlaceCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaceCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
