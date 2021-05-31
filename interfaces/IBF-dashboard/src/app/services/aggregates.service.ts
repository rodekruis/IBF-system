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
    private mockScenarioService: MockScenarioService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.timelineService
      .getTimelineSubscription()
      .subscribe(this.onLeadTimeChange);

    this.mockScenarioService
      .getMockScenarioSubscription()
      .subscribe(this.onMockScenarioChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.loadMetadataAndAggregates();
  };

  private onLeadTimeChange = () => {
    this.loadMetadataAndAggregates();
  };

  private onMockScenarioChange = () => {
    this.loadAggregateInformation();
  };

  loadMetadataAndAggregates() {
    if (this.country) {
      this.apiService
        .getIndicators(this.country.countryCodeISO3)
        .subscribe(this.onIndicatorChange);
    }
  }

  private onIndicator = (indicator: Indicator) => {
    this.mapService.loadAggregateLayer(indicator);
  };

  private onIndicatorChange = (indicators) => {
    this.indicators = indicators;
    this.mapService.hideAggregateLayers();
    this.indicators.forEach(this.onIndicator);
    this.indicatorSubject.next(this.indicators);

    this.loadAggregateInformation();
  };

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  private onEachIndicatorByFeatureAndAggregate = (feature, aggregate) => (
    indicator: Indicator,
  ) => {
    if (indicator.aggregateIndicator.includes(this.country.countryCodeISO3)) {
      console.log('feature.properties: ', feature.properties);
      if (indicator.name in feature.properties) {
        aggregate[indicator.name] = feature.properties[indicator.name];
      } else if (indicator.name in feature.properties.indicators) {
        aggregate[indicator.name] =
          feature.properties.indicators[indicator.name];
      } else {
        aggregate[indicator.name] = 0;
      }
    }
  };

  private onEachAdminFeature = (feature) => {
    const aggregate = {
      placeCode: feature.properties.placeCode,
    };

    this.indicators.forEach(
      this.onEachIndicatorByFeatureAndAggregate(feature, aggregate),
    );

    return aggregate;
  };

  private onAdminRegions = (adminRegions) => {
    this.aggregates = adminRegions.features.map(this.onEachAdminFeature);
  };

  loadAggregateInformation(): void {
    if (this.country) {
      this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.timelineService.activeLeadTime,
          this.adminLevelService.adminLevel,
        )
        .subscribe(this.onAdminRegions);
    }
  }

  getAggregate(
    weightedAverage: boolean,
    indicator: IbfLayerName,
    placeCode: string,
  ): number {
    return this.aggregates.reduce(
      this.aggregateReducer(weightedAverage, indicator, placeCode),
      0,
    );
  }

  private aggregateReducer = (
    weightedAverage: boolean,
    indicator: IbfLayerName,
    placeCode: string,
  ) => (accumulator, aggregate) => {
    // console.log('accumulator: ', accumulator);
    // console.log('placeCode: ', placeCode);
    let indicatorValue = 0;

    if (placeCode === null || placeCode === aggregate.placeCode) {
      const indicatorWeight = weightedAverage
        ? aggregate[this.country.disasterTypes[0].actionsUnit]
        : 1;
      indicatorValue = indicatorWeight * aggregate[indicator];
    }

    console.log('indicatorValue: ', indicatorValue);
    return accumulator + indicatorValue;
  };
}
