import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AdminLevelService } from 'src/app/services/admin-level.service';

describe('AdminLevelService', () => {
  let service: AdminLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AdminLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
