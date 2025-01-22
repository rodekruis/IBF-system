import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country, DisasterType } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel } from 'src/app/types/admin-level';
import {
  Aggregate,
  AggregateByPlaceCode,
  AggregateRecord,
} from 'src/app/types/aggregate';
import { EventState } from 'src/app/types/event-state';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { TimelineState } from 'src/app/types/timeline-state';
import { TriggeredArea } from 'src/app/types/triggered-area';

export enum AreaStatus {
  NonTriggeredOrWarned = 'non-triggered-or-warned',
  TriggeredOrWarned = 'triggered-or-warned',
}
@Injectable({
  providedIn: 'root',
})
export class AggregatesService {
  private indicatorSubject = new BehaviorSubject<Indicator[]>([]);
  public indicators: Indicator[] = [];
  private aggregates: Aggregate[] = [];
  public nrTriggerAreas: number;
  private country: Country;
  private disasterType: DisasterType;
  private eventState: EventState;
  public timelineState: TimelineState;
  private adminLevel: AdminLevel;
  public triggeredAreas: TriggeredArea[];
  private placeCode: PlaceCode;

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

  private onIndicatorChange = (indicators: Indicator[]) => {
    this.indicators = indicators;
    this.mapService.removeAggregateLayers();
    this.indicators.forEach((indicator) => {
      this.mapService.loadAggregateLayer(indicator);
    });
    this.indicatorSubject.next(this.indicators);

    this.loadAggregateInformation();
  };

  getIndicators(): Observable<Indicator[]> {
    return this.indicatorSubject.asObservable();
  }

  private onEachIndicatorByFeatureAndAggregate =
    (feature: AggregateByPlaceCode, aggregate: Aggregate) =>
    (indicator: Indicator) => {
      const foundIndicator = feature.records.find(
        (a) => a.indicator === indicator.name,
      );

      if (foundIndicator) {
        aggregate[indicator.name] = foundIndicator.value;
      }

      aggregate.areaStatus =
        Number(aggregate[IbfLayerName.alertThreshold]) > 0
          ? AreaStatus.TriggeredOrWarned
          : Number(aggregate[this.disasterType.actionsUnit]) > 0 &&
              this.eventState.events?.length > 0
            ? AreaStatus.TriggeredOrWarned
            : AreaStatus.NonTriggeredOrWarned; // Refactor: What is this needed for?
    };

  private onEachPlaceCode = (feature: AggregateByPlaceCode) => {
    const aggregate: Aggregate = {
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

  private onAggregateData = (records: AggregateRecord[]) => {
    const groupsByPlaceCode = this.aggregateOnPlaceCode(records);
    this.aggregates = groupsByPlaceCode.map(this.onEachPlaceCode);
    this.nrTriggerAreas = this.aggregates.filter(
      (a) => a.areaStatus === AreaStatus.TriggeredOrWarned,
    ).length;
  };

  private aggregateOnPlaceCode(
    array: AggregateRecord[],
  ): AggregateByPlaceCode[] {
    const groupsByPlaceCode: AggregateByPlaceCode[] = [];
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

  public getAggregate(
    weightedAverage: boolean,
    indicator: IbfLayerName,
    placeCode: string,
    numberFormat: NumberFormat,
    areaStatus: AreaStatus,
  ): number {
    let weighingIndicatorName: IbfLayerName;
    if (this.disasterType) {
      weighingIndicatorName = this.getWeighingIndicatorName(indicator);
    }

    const weighedSum = this.aggregates
      .filter((a) => a.areaStatus === areaStatus)
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
      const sumOfWeights: number = this.aggregates.reduce(
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

  private aggregateReducer =
    (
      weightedAverage: boolean,
      indicator: IbfLayerName,
      weighingIndicator: IbfLayerName,
      placeCode: string,
    ) =>
    (accumulator: number, aggregate: Aggregate) => {
      let indicatorValue = 0;

      if (placeCode === null || placeCode === aggregate.placeCode) {
        const indicatorWeight = weightedAverage
          ? Number(aggregate[weighingIndicator])
          : 1;

        indicatorValue = indicatorWeight * (Number(aggregate[indicator]) || 0);
      }

      return accumulator + indicatorValue;
    };

  public isAggregateNan(
    indicator: IbfLayerName,
    placeCode: string,
    weightedAverage: boolean,
  ): boolean {
    let aggregates = this.aggregates;
    if (placeCode) {
      aggregates = this.aggregates.filter((a) => a.placeCode === placeCode);
    }

    if (weightedAverage) {
      indicator = this.getWeighingIndicatorName(indicator);
    }

    return aggregates.every((a) => a[indicator] === null);
  }

  private getWeighingIndicatorName(indicator: IbfLayerName): IbfLayerName {
    let weighingIndicatorName = this.indicators.find(
      (i) => i.name === indicator,
    ).weightVar;
    if (!weighingIndicatorName) {
      weighingIndicatorName = this.indicators.find(
        (i) => i.name === this.disasterType.actionsUnit,
      )?.name;
    }

    return weighingIndicatorName;
  }
}
