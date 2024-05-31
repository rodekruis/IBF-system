import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
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
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { EventState } from 'src/app/types/event-state';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { firstCharOfWordsToUpper } from '../../../shared/utils';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { EapActionsService } from '../../services/eap-actions.service';
import { MapViewService } from '../../services/map-view.service';
import { AdminLevelType } from '../../types/admin-level';
import { MapView } from '../../types/map-view';
import { TriggeredArea } from '../../types/triggered-area';
import { LayerControlInfoPopoverComponent } from '../layer-control-info-popover/layer-control-info-popover.component';
@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent implements OnInit, OnDestroy {
  @Input()
  public areaStatus: string;

  public indicators: Indicator[] = [];
  public placeCode: PlaceCode;
  public placeCodeHover: PlaceCode;
  private country: Country;
  private disasterType: DisasterType;
  public countryDisasterSettings: CountryDisasterSettings;
  private aggregateComponentTranslateNode = 'aggregates-component';
  private exposedPrefixTranslateNode = 'exposed-prefix';
  private stoppedPrefixTranslateNode = 'stopped-prefix';
  private exposedPrefix: string;
  private triggeredPlaceCodes: string[] = [];
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
  private eapActionSubscription: Subscription;

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
    private eapActionsService: EapActionsService,
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

    this.translateSubscription = this.translateService
      .get(this.aggregateComponentTranslateNode)
      .subscribe(this.onTranslate);

    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);

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
    this.eapActionSubscription.unsubscribe();
  }

  public showAggregatesSection() {
    if (this.placeCode || this.placeCodeHover) {
      return this.showPlaceCodeView(this.placeCode || this.placeCodeHover);
    }
    return this.showNationalView();
  }

  private onTranslate = (translatedStrings) => {
    this.exposedPrefix =
      translatedStrings[
        this.isActiveAreas()
          ? this.exposedPrefixTranslateNode
          : this.stoppedPrefixTranslateNode
      ];
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
    this.countryDisasterSettings = this.disasterTypeService.getCountryDisasterTypeSettings(
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
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    popover.present();
  }

  private getPopoverText(indicator: Indicator): string {
    if (
      indicator.description &&
      indicator.description[this.country.countryCodeISO3] &&
      indicator.description[this.country.countryCodeISO3][
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
      this.areaStatus as AreaStatus,
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
              ? `${this.translateService.instant(
                  'aggregates-component.predicted',
                )} ${firstCharOfWordsToUpper(this.disasterType.label)}`
              : `${this.exposedPrefix} ${this.getAdminAreaLabel('singular')}`,
          }
        : {
            headerLabel: this.translateService.instant(
              'aggregates-component.national-view',
            ),
            subHeaderLabel: `${this.getAreaCount()} ${
              this.countryDisasterSettings?.isEventBased
                ? `${this.translateService.instant(
                    'aggregates-component.predicted',
                  )} ${
                    firstCharOfWordsToUpper(this.disasterType.label) +
                    this.translateService.instant(
                      'aggregates-component.plural-suffix',
                    )
                  }`
                : `${this.exposedPrefix} ${this.getAdminAreaLabel()}`
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
            subHeaderLabel: `${this.getAreaCount()} ${
              this.exposedPrefix
            } ${this.getAdminAreaLabel()}`,
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
                ? `${this.getAreaCount()} ${
                    this.exposedPrefix
                  } ${this.getAdminAreaLabel()}`
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

  private getAdminAreaLabel(singularPlural?: string) {
    if (
      !this.country ||
      !this.country.adminRegionLabels ||
      !this.adminLevelService ||
      !this.adminLevelService.adminLevel
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

  public showPlaceCodeView(placeCode: PlaceCode): boolean {
    return (
      placeCode &&
      (this.isCorrectStatusPlaceCode(placeCode) ||
        this.isNonTriggeredPlaceCode(placeCode))
    );
  }

  private showNationalView(): boolean {
    return (
      this.areaStatus === AreaStatus.TriggeredOrWarned ||
      this.getAreaCount() > 0
    );
  }

  private isNonTriggeredPlaceCode(placeCode: PlaceCode): boolean {
    return (
      this.isActiveAreas() &&
      !this.triggeredPlaceCodes.includes(placeCode.placeCode)
    );
  }

  private isCorrectStatusPlaceCode(placeCode: PlaceCode): boolean {
    return this.aggregatesPlaceCodes.includes(placeCode.placeCode);
  }

  public isActiveAreas(): boolean {
    return this.areaStatus === AreaStatus.TriggeredOrWarned ? true : false;
  }
  private getAreaCount(): number {
    return this.isActiveAreas()
      ? this.aggregatesService.nrTriggerActiveAreas
      : this.aggregatesService.nrTriggerStoppedAreas;
  }

  private onTriggeredAreasChange = (triggeredAreas: TriggeredArea[]) => {
    if (!triggeredAreas) {
      this.triggeredPlaceCodes = [];
    }
    this.triggeredPlaceCodes = triggeredAreas.map((a) => a.placeCode);
    let filtered = [];
    this.isActiveAreas()
      ? (filtered = triggeredAreas.filter((a) => !a.stopped))
      : (filtered = triggeredAreas.filter((a) => a.stopped));
    this.aggregatesPlaceCodes = filtered.map((a) => a.placeCode);
  };
  isAggregateNan(indicator: IbfLayerName, weightedAverage: boolean): boolean {
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
