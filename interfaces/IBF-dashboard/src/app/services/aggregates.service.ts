import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator } from 'src/app/types/indicator-group';
import { MockScenarioService } from '../mocks/mock-scenario-service/mock-scenario.service';
import { MockScenario } from '../mocks/mock-scenario.enum';
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
    const activeCountry = this.countryService.getActiveCountry();
    this.apiService
      .getMetadata(activeCountry.countryCodeISO3)
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

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  async loadAggregateInformation() {
    const activeCountry = this.countryService.getActiveCountry();
    const adminRegions = await this.apiService.getAdminRegions(
      activeCountry.countryCodeISO3,
      this.timelineService.activeLeadTime,
      this.adminLevelService.adminLevel,
    );

    this.aggregates = adminRegions.features.map((feature) => {
      let aggregate = {
        pCode: feature.properties.pcode,
      };
      this.indicators.forEach((indicator: Indicator) => {
        if (indicator.aggregateIndicator) {
          if (indicator.name in feature.properties) {
            aggregate[indicator.name] = feature.properties[indicator.name];
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

  getAggregate(
    weightedAvg: boolean,
    indicator: IbfLayerName,
    pCode: string,
  ): number {
    if (weightedAvg) {
      return this.getExposedAbsSumFromPerc(indicator, pCode);
    } else {
      return this.getSum(indicator, pCode);
    }
  }

  getSum(indicator: IbfLayerName, pCode: string) {
    return this.aggregates.reduce(
      (accumulator, aggregate) =>
        accumulator +
        (pCode === null || pCode === aggregate.pCode
          ? aggregate[indicator]
          : 0),
      0,
    );
  }

  getExposedAbsSumFromPerc(indicator: IbfLayerName, pCode: string) {
    return this.aggregates.reduce(
      (accumulator, aggregate) =>
        accumulator +
        (pCode === null || pCode === aggregate.pCode
          ? aggregate[IbfLayerName.population_affected] * aggregate[indicator]
          : 0),
      0,
    );
  }
}
