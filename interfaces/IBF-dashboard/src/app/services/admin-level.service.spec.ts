import { TestBed } from '@angular/core/testing';
import { AdminLevelService } from './admin-level.service';

describe('AdminLevelService', () => {
  let service: AdminLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
