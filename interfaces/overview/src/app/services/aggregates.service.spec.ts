import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AggregatesService } from './aggregates.service';

describe('AggregatesService', () => {
  let service: AggregatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AggregatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
