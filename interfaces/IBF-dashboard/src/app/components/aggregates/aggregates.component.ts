import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country, DisasterType } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { EventState } from 'src/app/types/event-state';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { EapActionsService } from '../../services/eap-actions.service';
import { TriggeredArea } from '../../types/triggered-area';
import { LayerControlInfoPopoverComponent } from '../layer-control-info-popover/layer-control-info-popover.component';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent implements OnInit, OnDestroy {
  @Input()
  public triggerStatus: string;

  public indicators: Indicator[] = [];
  public placeCode: PlaceCode;
  public placeCodeHover: PlaceCode;
  private country: Country;
  private disasterType: DisasterType;
  private aggregateComponentTranslateNode = 'aggregates-component';
  private defaultHeaderLabelTranslateNode = 'default-header-label';
  private exposedPrefixTranslateNode = 'exposed-prefix';
  private stoppedPrefixTranslateNode = 'stopped-prefix';
  private allPrefixTranslateNode = 'all-prefix';
  private triggeredPlaceCodes: string[] = [];
  public aggregatesPlaceCodes: string[] = [];

  private defaultHeaderLabel: string;
  private exposedPrefix: string;
  private allPrefix: string;

  private eventState: EventState;

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
    this.defaultHeaderLabel =
      translatedStrings[this.defaultHeaderLabelTranslateNode];
    this.exposedPrefix =
      translatedStrings[
        this.isActiveAreas()
          ? this.exposedPrefixTranslateNode
          : this.stoppedPrefixTranslateNode
      ];
    this.allPrefix = translatedStrings[this.allPrefixTranslateNode];
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;
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
    // clean data to avoid these inefficient filters and loops
    const filterAggregateIndicators = (indicator: Indicator) =>
      indicator.aggregateIndicator.includes(this.country.countryCodeISO3);

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
      isActiveTrigger: this.eventService.state.activeTrigger,
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
    const placeCode = this.placeCode || this.placeCodeHover;
    return this.aggregatesService.getAggregate(
      weightedAvg,
      indicatorName,
      placeCode ? placeCode.placeCode : null,
      numberFormat,
      this.triggerStatus,
    );
  }

  public getLabelAreasExposed() {
    let headerLabel = this.defaultHeaderLabel;
    let subHeaderLabel = '';

    const placeCode = this.placeCode || this.placeCodeHover;
    if (this.showPlaceCodeView(placeCode)) {
      headerLabel = placeCode.placeCodeName;
      if (placeCode.placeCodeParentName) {
        subHeaderLabel = `(${placeCode.placeCodeParentName})`;
      }
    } else {
      if (this.country) {
        if (
          this.eventState?.activeTrigger &&
          this.country.adminRegionLabels[this.adminLevelService.adminLevel]
        ) {
          const adminAreaLabel = this.country.adminRegionLabels[
            this.adminLevelService.adminLevel
          ][this.getAreaCount() === 1 ? 'singular' : 'plural'];
          headerLabel = `${this.exposedPrefix} ${adminAreaLabel}`;
        } else {
          headerLabel = `${this.allPrefix} ${this.country.countryName}`;
        }
      }
    }

    return { headerLabel, subHeaderLabel };
  }

  public getNumberAreasExposed() {
    let headerLabel;

    const placeCode = this.placeCode || this.placeCodeHover;
    if (this.showPlaceCodeView(placeCode)) {
      headerLabel = '';
    } else {
      if (this.country) {
        if (this.eventState?.activeTrigger) {
          headerLabel = `${this.getAreaCount()}`;
        } else {
          headerLabel = '';
        }
      }
    }

    return headerLabel;
  }

  public showPlaceCodeView(placeCode: PlaceCode): boolean {
    return (
      placeCode &&
      (this.isCorrectStatusPlaceCode(placeCode) ||
        this.isNonTriggeredPlaceCode(placeCode))
    );
  }

  private showNationalView(): boolean {
    return this.triggerStatus === 'trigger-active' || this.getAreaCount() > 0;
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

  public clearPlaceCode() {
    this.placeCodeService.clearPlaceCode();
  }

  public isActiveAreas(): boolean {
    return this.triggerStatus === 'trigger-active' ? true : false;
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
}
