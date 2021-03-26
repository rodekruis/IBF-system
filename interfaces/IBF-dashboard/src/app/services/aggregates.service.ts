import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator } from 'src/app/types/indicator-group';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { Country } from '../models/country.model';
import { IbfLayerName } from '../types/ibf-layer';
import { AdminLevelService } from './admin-level.service';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new BehaviorSubject<Indicator[]>([]);
  public indicators: Indicator[] = [];
  private aggregates = [];
  private country: Country;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private mapService: MapService,
    private eventService: EventService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.country = country;
        this.loadMetadataAndAggregates();
      });

    this.timelineService.getTimelineSubscription().subscribe(() => {
      this.loadMetadataAndAggregates();
    });

    this.mockScenarioService.getMockScenarioSubscription().subscribe(() => {
      this.loadAggregateInformation();
    });
  }

  loadMetadataAndAggregates() {
    if (this.country) {
      this.apiService
        .getIndicators(this.country.countryCodeISO3)
        .subscribe((response) => {
          this.indicators = response;

          // Load 'exposed population' layer by default if trigger
          const activeTrigger = this.eventService.state.activeTrigger;
          this.indicators.find(
            (i): boolean => i.name === IbfLayerName.population_affected,
          ).active = activeTrigger;

          this.mapService.hideAggregateLayers();
          this.indicators.forEach((indicator: Indicator) => {
            this.mapService.loadAggregateLayer(indicator);
          });
          this.indicatorSubject.next(this.indicators);

          this.loadAggregateInformation();
        });
    }
  }

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  loadAggregateInformation(): void {
    if (this.country) {
      this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
          this.adminLevelService.adminLevel,
        )
        .subscribe((adminRegions) => {
          this.aggregates = adminRegions.features.map((feature) => {
            const aggregate = {
              placeCode: feature.properties.pcode,
            };

            this.indicators.forEach((indicator: Indicator) => {
              if (indicator.aggregateIndicator) {
                if (indicator.name in feature.properties) {
                  aggregate[indicator.name] =
                    feature.properties[indicator.name];
                } else if (indicator.name in feature.properties.indicators) {
                  aggregate[indicator.name] =
                    feature.properties.indicators[indicator.name];
                } else {
                  aggregate[indicator.name] = 0;
                }
              }
            });

            return aggregate;
          });
        });
    }
  }

  getAggregate(
    weightedAvg: boolean,
    indicator: IbfLayerName,
    placeCode: string,
  ): number {
    if (weightedAvg) {
      return this.getExposedAbsSumFromPerc(indicator, placeCode);
    } else {
      return this.getSum(indicator, placeCode);
    }
  }

  getSum(indicator: IbfLayerName, placeCode: string) {
    return this.aggregates.reduce(
      (accumulator, aggregate) =>
        accumulator +
        (placeCode === null || placeCode === aggregate.placeCode
          ? aggregate[indicator]
          : 0),
      0,
    );
  }

  getExposedAbsSumFromPerc(indicator: IbfLayerName, placeCode: string) {
    return this.aggregates.reduce(
      (accumulator, aggregate) =>
        accumulator +
        (placeCode === null || placeCode === aggregate.placeCode
          ? aggregate[IbfLayerName.population_affected] * aggregate[indicator]
          : 0),
      0,
    );
  }
}
