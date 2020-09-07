import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private aggregates = {};

  constructor(private apiService: ApiService) {
    this.loadAggregateInformation();
  }

  getMetadata(countryCode: string = environment.defaultCountryCode) {
    return this.apiService.getMetadata(countryCode);
  }

  loadAggregateInformation(
    countryCode: string = environment.defaultCountryCode,
    leadTime: string = '7-day',
    adminLevel: number = 2,
  ) {
    this.apiService
      .getMatrixAggregates(countryCode, leadTime, adminLevel)
      .then((response) => {
        this.aggregates = response;
      });
  }

  getAggregate(indicator) {
    return this.aggregates[indicator];
  }
}
