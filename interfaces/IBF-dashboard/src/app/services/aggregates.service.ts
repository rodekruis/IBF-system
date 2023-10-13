import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { Country, DisasterType } from '../models/country.model';
import { PlaceCode } from '../models/place-code.model';
import { AdminLevel } from '../types/admin-level';
import { EventState } from '../types/event-state';
import { IbfLayerName } from '../types/ibf-layer';
import { TimelineState } from '../types/timeline-state';
import { TriggeredArea } from '../types/triggered-area';
import { AdminLevelService } from './admin-level.service';
import { DisasterTypeService } from './disaster-type.service';
import { EapActionsService } from './eap-actions.service';
import { EventService } from './event.service';
import { PlaceCodeService } from './place-code.service';

export enum AreaStatus {
  TriggeredOrWarned = 'triggered-or-warned',
  NonTriggeredOrWarnd = 'non-triggered-or-warned',
  Stopped = 'stopped',
}
@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new BehaviorSubject<Indicator[]>([]);
  public indicators: Indicator[] = [];
  private aggregates = [];
  public nrTriggerActiveAreas: number;
  public nrTriggerStoppedAreas: number;
  private country: Country;
  private disasterType: DisasterType;
  private eventState: EventState;
  public timelineState: TimelineState;
  private adminLevel: AdminLevel;
  private defaultAdminLevel: AdminLevel;
  public triggeredAreas: TriggeredArea[];
  private placeCode: PlaceCode;
  private AREA_STATUS_KEY = 'areaStatus';

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private mapService: MapService,
    private disasterTypeService: DisasterTypeService,
    private eventService: EventService,
    private eapActionsService: EapActionsService,
    private placeCodeService: PlaceCodeService,
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

    this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;

    if (!this.country) {
      return;
    }
    this.defaultAdminLevel = this.disasterTypeService.getCountryDisasterTypeSettings()?.defaultAdminLevel;
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;
  };

  private onAdminLevelChange = (adminLevel: AdminLevel) => {
    this.adminLevel = adminLevel;
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
  };

  private onTriggeredAreasChange = (triggeredAreas: TriggeredArea[]) => {
    this.triggeredAreas = triggeredAreas;
    this.loadMetadataAndAggregates();
  };

  loadMetadataAndAggregates() {
    if (
      this.country &&
      this.disasterType &&
      this.eventState &&
      this.timelineState &&
      this.adminLevel
    ) {
      this.apiService
        .getIndicators(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe(this.onIndicatorChange);
    }
  }

  private onIndicatorChange = (indicators) => {
    this.indicators = indicators;
    this.mapService.removeAggregateLayers();
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

    const area = this.mapService.getAreaByPlaceCode(
      feature.placeCode,
      feature.placeCodeParent,
    );

    if (foundIndicator) {
      aggregate[indicator.name] = foundIndicator.value;
    }

    aggregate[this.AREA_STATUS_KEY] = area?.stopped
      ? AreaStatus.Stopped
      : aggregate[IbfLayerName.alertThreshold] > 0
      ? AreaStatus.TriggeredOrWarned
      : aggregate[this.disasterType.actionsUnit] > 0 &&
        this.eventState.activeTrigger
      ? AreaStatus.TriggeredOrWarned
      : AreaStatus.NonTriggeredOrWarnd;
  };

  private onEachPlaceCode = (feature) => {
    const aggregate = {
      placeCode: feature.placeCode,
      placeCodeParent: feature.placeCodeParent,
    };
    this.indicators.forEach(
      this.onEachIndicatorByFeatureAndAggregate(feature, aggregate),
    );

    return aggregate;
  };

  loadAggregateInformation(): void {
    if (
      this.country &&
      this.disasterType &&
      this.timelineState &&
      this.adminLevel &&
      this.eventState
    ) {
      this.apiService
        .getAggregatesData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.adminLevel,
          this.timelineState.activeLeadTime,
          this.eventState.event?.eventName,
          this.mapService.getPlaceCodeParent(this.placeCode),
        )
        .subscribe(this.onAggregateData);
    }
  }

  private onAggregateData = (records) => {
    const groupsByPlaceCode = this.aggregateOnPlaceCode(records);
    this.aggregates = groupsByPlaceCode.map(this.onEachPlaceCode);
    this.nrTriggerActiveAreas = this.aggregates.filter(
      (a) => a[this.AREA_STATUS_KEY] === AreaStatus.TriggeredOrWarned,
    ).length;

    this.nrTriggerStoppedAreas = this.aggregates.filter(
      (a) => a[this.AREA_STATUS_KEY] === AreaStatus.Stopped,
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
          placeCodeParent: record.placeCodeParent,
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
    areaStatus: AreaStatus,
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
    const weighedSum = this.aggregates
      .filter((a) => a[this.AREA_STATUS_KEY] === areaStatus)
      .reduce(
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
      indicatorValue = indicatorWeight * (aggregate[indicator] || 0);
    }

    return accumulator + indicatorValue;
  };
}
