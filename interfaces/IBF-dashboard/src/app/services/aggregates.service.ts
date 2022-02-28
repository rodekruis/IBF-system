import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { Country, DisasterType } from '../models/country.model';
import { AdminLevel } from '../types/admin-level';
import { EventState } from '../types/event-state';
import { IbfLayerName } from '../types/ibf-layer';
import { TimelineState } from '../types/timeline-state';
import { AdminLevelService } from './admin-level.service';
import { DisasterTypeService } from './disaster-type.service';
import { EapActionsService } from './eap-actions.service';
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
  private eventState: EventState;
  public timelineState: TimelineState;
  private adminLevel: AdminLevel;
  public triggeredAreas: any[];

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private mapService: MapService,
    private disasterTypeService: DisasterTypeService,
    private eventService: EventService,
    private eapActionsService: EapActionsService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe(this.onAdminLevelChange);

    this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
    this.loadMetadataAndAggregates();
  };

  private onAdminLevelChange = (adminLevel: AdminLevel) => {
    this.adminLevel = adminLevel;
    this.loadMetadataAndAggregates();
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
    this.loadMetadataAndAggregates();
  };

  private onTriggeredAreasChange = (triggeredAreas: any[]) => {
    this.triggeredAreas = triggeredAreas;
    this.loadMetadataAndAggregates();
  };

  loadMetadataAndAggregates() {
    if (
      this.country &&
      this.disasterType &&
      this.eventState &&
      this.timelineState &&
      this.adminLevel &&
      this.triggeredAreas &&
      this.mapService.checkCountryDisasterTypeMatch(
        this.country,
        this.disasterType,
      )
    ) {
      this.apiService
        .getIndicators(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.eventState.event?.eventName,
        )
        .subscribe(this.onIndicatorChange);
    }
  }

  private onIndicatorChange = (indicators) => {
    this.indicators = indicators;
    this.mapService.hideAggregateLayers();
    this.indicators.forEach((indicator) =>
      this.mapService.loadAggregateLayer(indicator),
    );
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
    const areaState = this.triggeredAreas.find(
      (area) => area.placeCode === feature.placeCode,
    );
    if (areaState?.stopped && indicator.dynamic) {
      aggregate[indicator.name] = 0;
    } else if (foundIndicator) {
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

  loadAggregateInformation(): void {
    if (this.country && this.disasterType) {
      this.apiService
        .getAggregatesData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineState.activeLeadTime,
          this.adminLevel,
          this.eventState.event?.eventName,
        )
        .subscribe(this.onAggregateData);
    }
  }

  private onAggregateData = (records) => {
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

  getAggregate(
    weightedAverage: boolean,
    indicator: IbfLayerName,
    placeCode: string,
    numberFormat: NumberFormat,
  ): number {
    let weighingIndicatorName: IbfLayerName;
    if (this.disasterType) {
      weighingIndicatorName = this.indicators.find((i) => i.name === indicator)
        .weightVar;
      if (!weighingIndicatorName) {
        weighingIndicatorName = this.indicators.find(
          (i) => i.name === this.disasterType.actionsUnit,
        )?.name;
      }
    }
    const weighedSum = this.aggregates.reduce(
      this.aggregateReducer(
        weightedAverage,
        indicator,
        weighingIndicatorName,
        placeCode,
      ),
      0,
    );

    let aggregateValue: number;
    if (numberFormat === NumberFormat.perc) {
      const sumOfWeights = this.aggregates.reduce(
        this.aggregateReducer(false, weighingIndicatorName, null, placeCode),
        0,
      );
      aggregateValue =
        sumOfWeights === 0 ? weighedSum : weighedSum / sumOfWeights;
    } else {
      aggregateValue = weighedSum;
    }
    return aggregateValue;
  }

  private aggregateReducer = (
    weightedAverage: boolean,
    indicator: IbfLayerName,
    weighingIndicator: IbfLayerName,
    placeCode: string,
  ) => (accumulator, aggregate) => {
    let indicatorValue = 0;

    if (placeCode === null || placeCode === aggregate.placeCode) {
      const indicatorWeight = weightedAverage
        ? aggregate[weighingIndicator]
        : 1;
      indicatorValue = indicatorWeight * aggregate[indicator];
    }

    return accumulator + indicatorValue;
  };
}
