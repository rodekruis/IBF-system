import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminLevelService } from './admin-level.service';

describe('AdminLevelService', () => {
  let service: AdminLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(AdminLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
