import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Indicator } from '../types/indicator-group';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new Subject<Indicator[]>();
  public indicators: Indicator[];
  private aggregates = {};

  constructor(private apiService: ApiService) {
    this.loadMetadata();
    this.loadAggregateInformation();
  }

  loadMetadata(countryCode: string = environment.defaultCountryCode) {
    this.apiService.getMetadata(countryCode).then((response) => {
      this.indicatorSubject.next(response);
      this.indicators = response;
    });
  }

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  loadAggregateInformation(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
    adminLevel: number = 2,
  ) {
    this.apiService
      .getMatrixAggregates(countryCode, leadTime, adminLevel)
      .then((response) => {
        if (response) {
          this.aggregates = response;
        }
      });
  }

  getAggregate(indicator) {
    return this.aggregates[indicator];
  }
}
