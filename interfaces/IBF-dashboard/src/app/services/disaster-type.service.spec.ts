import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';

describe('DisasterTypeService', () => {
  let service: DisasterTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DisasterTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
