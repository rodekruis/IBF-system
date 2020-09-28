import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator } from 'src/app/types/indicator-group';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService implements OnDestroy {
  private indicatorSubject = new Subject<Indicator[]>();
  private timelineSubscription: Subscription;
  public indicators: Indicator[];
  private aggregates = {};

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    private apiService: ApiService,
  ) {
    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe((timeline: string) => {
        this.loadMetadata(this.countryService.selectedCountry.countryCode);
        this.loadAggregateInformation(
          this.countryService.selectedCountry.countryCode,
          timeline,
        );
      });
  }

  ngOnDestroy() {
    this.timelineSubscription.unsubscribe();
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
