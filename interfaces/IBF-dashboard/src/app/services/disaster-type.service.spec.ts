import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DisasterTypeService } from './disaster-type.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DisasterTypeService', () => {
  let service: DisasterTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(DisasterTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
