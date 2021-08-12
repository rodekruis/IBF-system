import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DisasterTypeService } from './disaster-type.service';

describe('DisasterTypeService', () => {
  let service: DisasterTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(DisasterTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
