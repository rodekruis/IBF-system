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

  getPopulationExposed() {
    return this.aggregates['population_affected'];
  }
}
