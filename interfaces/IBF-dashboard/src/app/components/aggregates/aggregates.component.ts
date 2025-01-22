import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import {
  AggregatesService,
  AreaStatus,
} from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { EventService } from 'src/app/services/event.service';
import { MapViewService } from 'src/app/services/map-view.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { AdminLevelType } from 'src/app/types/admin-level';
import { EventState } from 'src/app/types/event-state';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { MapView } from 'src/app/types/map-view';
import { firstCharOfWordsToUpper } from 'src/shared/utils';
@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
  standalone: false,
})
export class AggregatesComponent implements OnInit, OnDestroy {
  public indicators: Indicator[] = [];
  public placeCode: PlaceCode;
  public placeCodeHover: PlaceCode;
  private country: Country;
  public disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;
  public aggregatesPlaceCodes: string[] = [];

  public eventState: EventState;
  public mapView: Observable<MapView>;

  private indicatorSubscription: Subscription;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private placeCodeHoverSubscription: Subscription;
  private translateSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
    private aggregatesService: AggregatesService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private adminLevelService: AdminLevelService,
    private popoverController: PopoverController,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService,
    private mapViewService: MapViewService,
  ) {
    this.initialEventStateSubscription = this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.manualEventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);
  }

  ngOnInit() {
    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.placeCodeHoverSubscription = this.placeCodeService
      .getPlaceCodeHoverSubscription()
      .subscribe(this.onPlaceCodeHoverChange);

    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe(this.onIndicatorChange);

    this.mapView = this.mapViewService.getAggregatesMapViewSubscription();
  }

  ngOnDestroy() {
    this.indicatorSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.placeCodeHoverSubscription.unsubscribe();
    this.translateSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
    this.changeDetectorRef.detectChanges();
  };

  private onPlaceCodeHoverChange = (placeCode: PlaceCode) => {
    this.placeCodeHover = placeCode;
    this.changeDetectorRef.detectChanges();
  };

  private onIndicatorChange = (newIndicators: Indicator[]) => {
    const filterAggregateIndicators = (indicator: Indicator) =>
      indicator.countryDisasterTypes[this.country.countryCodeISO3][
        this.disasterType.disasterType
      ].includes('aggregate');

    this.indicators = newIndicators.filter(filterAggregateIndicators);
  };

  public async moreInfo(indicator: Indicator): Promise<void> {
    const popover = await this.popoverController.create({
      component: LayerControlInfoPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-normal ${
        this.eventService.state.thresholdReached ? 'trigger-alert' : 'no-alert'
      }`,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        layer: {
          label: indicator.label,
          description: this.getPopoverText(indicator),
        },
      },
    });

    this.analyticsService.logEvent(AnalyticsEvent.aggregateInformation, {
      indicator: indicator.name,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventState.events?.length > 0,
      component: this.constructor.name,
    });

    void popover.present();
  }

  private getPopoverText(indicator: Indicator): string {
    if (
      indicator.description?.[this.country.countryCodeISO3]?.[
        this.disasterType.disasterType
      ]
    ) {
      return indicator.description[this.country.countryCodeISO3][
        this.disasterType.disasterType
      ];
    }
    return '';
  }

  public getAggregate(
    indicatorName: IbfLayerName,
    weightedAvg: boolean,
    numberFormat: NumberFormat,
  ) {
    const agg = this.aggregatesService.getAggregate(
      weightedAvg,
      indicatorName,
      this.getPlaceCodeValue(),
      numberFormat,
      AreaStatus.TriggeredOrWarned,
    );

    return agg;
  }

  public getAggregatesHeader(mapView: MapView) {
    if (mapView === MapView.national) {
      return this.placeCodeHover
        ? {
            headerLabel:
              this.placeCodeHover.placeCodeName ||
              this.placeCodeHover.placeCode,
            subHeaderLabel: this.countryDisasterSettings.isEventBased
              ? `${
                  this.translateService.instant(
                    'aggregates-component.predicted',
                  ) as string
                } ${firstCharOfWordsToUpper(this.disasterType.label)}`
              : `Exposed ${this.getAdminAreaLabel('singular')}`,
          }
        : {
            headerLabel: this.translateService.instant(
              'aggregates-component.national-view',
            ) as string,
            subHeaderLabel: `${this.getEventCount()?.toString()} ${
              this.countryDisasterSettings?.isEventBased
                ? `${
                    this.translateService.instant(
                      'aggregates-component.predicted',
                    ) as string
                  } ${firstCharOfWordsToUpper(this.disasterType.label)}${
                    this.translateService.instant(
                      'aggregates-component.plural-suffix',
                    ) as string
                  }`
                : `Exposed ${this.getAdminAreaLabel()}`
            }`,
          };
    }

    if (mapView === MapView.event) {
      return this.placeCodeHover
        ? {
            headerLabel: this.placeCodeHover.placeCodeName,
            subHeaderLabel: this.getAdminAreaLabel('singular'),
          }
        : {
            headerLabel: this.getEventNameString() || '',
            subHeaderLabel: `${this.getAreaCount().toString()} exposed ${this.getAdminAreaLabel()}`,
          };
    }

    if (
      [MapView.adminArea, MapView.adminArea2, MapView.adminArea3].includes(
        mapView,
      )
    ) {
      return this.placeCodeHover
        ? {
            headerLabel: this.placeCodeHover.placeCodeName,
            subHeaderLabel: this.getAdminAreaLabel('singular'),
          }
        : {
            headerLabel: this.placeCodeName(),
            subHeaderLabel:
              this.adminLevelService.getAdminLevelType(this.placeCode) ===
              AdminLevelType.higher
                ? `${this.getAreaCount().toString()} exposed ${this.getAdminAreaLabel()}`
                : this.getAdminAreaLabel('singular'),
          };
    }

    return {
      headerLabel: mapView,
      subHeaderLabel: mapView,
    };
  }

  private getEventNameString(): string {
    if (this.placeCode) {
      return this.placeCode.eventName?.split('_')[0];
    }

    if (this.placeCodeHover) {
      return this.placeCodeHover.eventName?.split('_')[0];
    }

    return this.eventState?.event?.eventName?.split('_')[0];
  }

  private getAdminAreaLabel(singularPlural?: string): string {
    if (
      !this.country?.adminRegionLabels ||
      !this.adminLevelService?.adminLevel
    ) {
      return '';
    }
    singularPlural =
      singularPlural || (this.getAreaCount() === 1 ? 'singular' : 'plural');
    return this.country.adminRegionLabels[this.adminLevelService.adminLevel][
      singularPlural
    ];
  }

  private placeCodeName(): string {
    if (this.placeCode) {
      return this.placeCode.placeCodeName;
    }

    if (this.placeCodeHover) {
      return this.placeCodeHover.placeCodeName;
    }

    return '';
  }

  private getAreaCount(): number {
    return this.aggregatesService.nrTriggerAreas;
  }

  private getEventCount(): number {
    return this.countryDisasterSettings?.isEventBased
      ? (this.eventState?.events?.length ?? 0)
      : this.getAreaCount();
  }

  public isAggregateNan(
    indicator: IbfLayerName,
    weightedAverage: boolean,
  ): boolean {
    return this.aggregatesService.isAggregateNan(
      indicator,
      this.getPlaceCodeValue(),
      weightedAverage,
    );
  }

  private getPlaceCodeValue(): string {
    const placeCode = this.placeCode || this.placeCodeHover;
    const adminLevelType = this.adminLevelService.getAdminLevelType(placeCode);
    // TODO: improve this logic

    return this.placeCodeHover // hovering should always lead to aggregate-numbers updating on any level
      ? this.placeCodeHover.placeCode
      : adminLevelType === AdminLevelType.higher // else if on higher of multiple levels, do not filter by placeCode, as it it still the parent placeCode, while the aggregates data is on the child-placeCodes
        ? null
        : placeCode // else if on single/deepest level, then follow normal behaviour of filtering on selected placeCode
          ? placeCode.placeCode
          : null; // .. or no filtering, if no placeCode is selected
  }
}
