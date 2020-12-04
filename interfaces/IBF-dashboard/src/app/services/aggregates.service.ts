import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator } from 'src/app/types/indicator-group';
import { AdminLevelService } from './admin-level.service';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new ReplaySubject<Indicator[]>();
  public indicators: Indicator[];
  private aggregates = {};

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private mapService: MapService,
  ) {}

  loadMetadata() {
    this.apiService
      .getMetadata(this.countryService.selectedCountry.countryCode)
      .then((response) => {
        const indicators = response;
        // Filter out population (to do: better to remove from metadata in db)
        this.indicators = indicators.filter((i) => i.name !== 'population');
        this.mapService.hideAggregateLayers();
        this.indicators.forEach((indicator: Indicator) => {
          this.mapService.loadAggregateLayer(indicator);
        });
        this.indicatorSubject.next(this.indicators);
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
        this.adminLevelService.adminLevel,
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
