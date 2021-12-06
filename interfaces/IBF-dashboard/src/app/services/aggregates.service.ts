import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import {
  Indicator,
  IndicatorGroup,
  NumberFormat,
} from 'src/app/types/indicator-group';
import { Country, DisasterType } from '../models/country.model';
import { IbfLayerName } from '../types/ibf-layer';
import { AdminLevelService } from './admin-level.service';
import { DisasterTypeService } from './disaster-type.service';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new BehaviorSubject<Indicator[]>([]);
  public indicators: Indicator[] = [];
  private aggregates = [];
  public nrTriggeredAreas: number;
  private country: Country;
  private disasterType: DisasterType;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private mapService: MapService,
    private disasterTypeService: DisasterTypeService,
    private eventService: EventService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.timelineService
      .getTimelineSubscription()
      .subscribe(this.onLeadTimeChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe(this.onAdminLevelChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.loadMetadataAndAggregates();
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.loadMetadataAndAggregates();
  };

  private onLeadTimeChange = () => {
    this.loadMetadataAndAggregates();
  };

  private onAdminLevelChange = () => {
    this.disasterType = this.disasterTypeService.disasterType;
    this.loadMetadataAndAggregates();
  };

  loadMetadataAndAggregates() {
    if (this.country && this.disasterType) {
      this.apiService
        .getIndicators(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onIndicatorChange);
    }
  }

  private onIndicator = (indicator: Indicator) => {
    if (indicator.group === IndicatorGroup.outline) {
      this.mapService.loadOutlineLayer(indicator);
    } else {
      this.mapService.loadAggregateLayer(indicator);
    }
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
    const foundIndicator = feature.records.find(
      (a) => a.indicator === indicator.name,
    );
    if (foundIndicator) {
      aggregate[indicator.name] = foundIndicator.value;
    } else {
      aggregate[indicator.name] = 0;
    }
  };

  private onEachPlaceCode = (feature) => {
    const aggregate = {
      placeCode: feature.placeCode,
    };
    this.indicators.forEach(
      this.onEachIndicatorByFeatureAndAggregate(feature, aggregate),
    );

    return aggregate;
  };

  private onAggregatesData = (records) => {
    const groupsByPlaceCode = this.aggregateOnPlaceCode(records);
    this.aggregates = groupsByPlaceCode.map(this.onEachPlaceCode);
    this.nrTriggeredAreas = this.aggregates.filter(
      (a) => a[this.disasterType.triggerUnit] > 0,
    ).length;
  };

  private aggregateOnPlaceCode(array) {
    const groupsByPlaceCode = [];
    array.forEach((record) => {
      if (
        groupsByPlaceCode.map((i) => i.placeCode).includes(record.placeCode)
      ) {
        groupsByPlaceCode
          .find((i) => i.placeCode === record.placeCode)
          .records.push(record);
      } else {
        groupsByPlaceCode.push({
          placeCode: record.placeCode,
          records: [record],
        });
      }
    });
    return groupsByPlaceCode;
  }

  loadAggregateInformation(): void {
    if (this.country && this.disasterType) {
      this.apiService
        .getAggregatesData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineService.activeLeadTime,
          this.adminLevelService.adminLevel,
          this.eventService.state.event?.eventName,
        )
        .subscribe(this.onAggregatesData);
    }
  }

  getAggregate(
    weightedAverage: boolean,
    indicator: IbfLayerName,
    placeCode: string,
    numberFormat: NumberFormat,
  ): number {
    if (this.disasterType) {
      const weighingIndicator = this.indicators.find(
        (i) => i.name === this.disasterType.actionsUnit,
      );
      if (
        weighingIndicator &&
        weighingIndicator.numberFormatAggregate === NumberFormat.perc
      ) {
        weightedAverage = false;
      }
    }

    let aggregateValue = this.aggregates.reduce(
      this.aggregateReducer(weightedAverage, indicator, placeCode),
      0,
    );

    // normalize when reducing percentage values https://math.stackexchange.com/a/3381907/482513
    if (
      !placeCode &&
      numberFormat === NumberFormat.perc &&
      this.aggregates.length > 0
    ) {
      aggregateValue = aggregateValue / this.aggregates.length;
    }
    return aggregateValue;
  }

  private aggregateReducer = (
    weightedAverage: boolean,
    indicator: IbfLayerName,
    placeCode: string,
  ) => (accumulator, aggregate) => {
    let indicatorValue = 0;

    if (placeCode === null || placeCode === aggregate.placeCode) {
      const indicatorWeight = weightedAverage
        ? aggregate[this.disasterType.actionsUnit]
        : 1;
      indicatorValue = indicatorWeight * aggregate[indicator];
    }

    return accumulator + indicatorValue;
  };
}
