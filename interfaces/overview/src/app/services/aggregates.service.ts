import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator } from 'src/app/types/indicator-group';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new Subject<Indicator[]>();
  public indicators: Indicator[];
  private aggregates = {};

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    private apiService: ApiService,
  ) {}

  loadMetadata() {
    this.apiService
      .getMetadata(this.countryService.selectedCountry.countryCode)
      .then((response) => {
        this.indicatorSubject.next(response);
        this.indicators = response;
      });
  }

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  loadAggregateInformation() {
    this.apiService
      .getMatrixAggregates(
        this.countryService.selectedCountry.countryCode,
        this.timelineService.state.selectedTimeStepButtonValue,
        this.countryService.selectedCountry.defaultAdminLevel,
      )
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
