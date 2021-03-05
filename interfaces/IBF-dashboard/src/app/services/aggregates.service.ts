import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator } from 'src/app/types/indicator-group';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from '../mocks/mock-scenario.enum';
import { Country } from '../models/country.model';
import { IbfLayerName } from '../types/ibf-layer';
import { AdminLevelService } from './admin-level.service';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new BehaviorSubject<Indicator[]>([]);
  public indicators: Indicator[] = [];
  private aggregates = [];

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private mapService: MapService,
    private mockScenarioService: MockScenarioService,
  ) {
    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe((mockScenario: MockScenario) => {
        this.loadAggregateInformation();
      });
  }

  loadMetadataAndAggregates() {
    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country): void => {
        if (country) {
          this.apiService
            .getIndicators(country.countryCodeISO3)
            .then((response) => {
              this.indicators = response;
              this.mapService.hideAggregateLayers();
              this.indicators.forEach((indicator: Indicator) => {
                this.mapService.loadAggregateLayer(indicator);
              });
              this.indicatorSubject.next(this.indicators);

              this.loadAggregateInformation();
            });
        }
      });
  }

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  loadAggregateInformation(): void {
    this.countryService.getCountrySubscription().subscribe(
      async (country: Country): Promise<void> => {
        if (country) {
          const adminRegions = await this.apiService.getAdminRegions(
            country.countryCodeISO3,
            this.timelineService.activeLeadTime,
            this.adminLevelService.adminLevel,
          );

          this.aggregates = adminRegions.features.map((feature) => {
            let aggregate = {
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
        }
      },
    );
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
