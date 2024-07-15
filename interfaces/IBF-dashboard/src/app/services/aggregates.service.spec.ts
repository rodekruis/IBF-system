import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AggregatesService } from './aggregates.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AggregatesService', () => {
  let service: AggregatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule,
        TranslateModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(AggregatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
