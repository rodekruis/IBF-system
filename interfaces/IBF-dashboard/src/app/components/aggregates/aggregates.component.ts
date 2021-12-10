import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { Country } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, NumberFormat } from 'src/app/types/indicator-group';
import { LayerControlInfoPopoverComponent } from '../layer-control-info-popover/layer-control-info-popover.component';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent implements OnInit, OnDestroy {
  public indicators: Indicator[] = [];
  public placeCode: PlaceCode;
  private country: Country;
  private aggregateComponentTranslateNode = 'aggregates-component';
  private defaultHeaderLabelTranslateNode = 'default-header-label';
  private exposedPrefixTranslateNode = 'exposed-prefix';
  private allPrefixTranslateNode = 'all-prefix';
  private popoverTranslateNode = 'popover';

  private defaultHeaderLabel: string;
  private exposedPrefix: string;
  private allPrefix: string;
  private popoverTexts: { [key: string]: string } = {};

  private indicatorSubscription: Subscription;
  private countrySubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private translateSubscription: Subscription;
  private eapActionSubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private aggregatesService: AggregatesService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private adminLevelService: AdminLevelService,
    private eapActionsService: EapActionsService,
    private popoverController: PopoverController,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService,
  ) {
    this.translateSubscription = this.translateService
      .get(this.aggregateComponentTranslateNode)
      .subscribe(this.onTranslate);
  }

  ngOnInit() {
    this.aggregatesService.loadMetadataAndAggregates();

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);

    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe(this.onIndicatorChange);
  }

  ngOnDestroy() {
    this.indicatorSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.translateSubscription.unsubscribe();
    this.eapActionSubscription.unsubscribe();
  }

  private onTranslate = (translatedStrings) => {
    this.defaultHeaderLabel =
      translatedStrings[this.defaultHeaderLabelTranslateNode];
    this.exposedPrefix = translatedStrings[this.exposedPrefixTranslateNode];
    this.allPrefix = translatedStrings[this.allPrefixTranslateNode];
    this.popoverTexts = translatedStrings[this.popoverTranslateNode];
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode) => {
    this.placeCode = placeCode;
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
      cssClass: 'ibf-indicator-information-popover',
      translucent: true,
      showBackdrop: true,
      componentProps: {
        layer: {
          label: indicator.label,
          description: this.getPopoverText(indicator.name),
        },
      },
    });

    this.analyticsService.logEvent(AnalyticsEvent.aggregateInformation, {
      indicator: indicator.name,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    popover.present();
  }

  private getPopoverText(indicatorName: IbfLayerName): string {
    let popoverText = '';
    if (this.popoverTexts[indicatorName]) {
      const countryCodeToUse = this.popoverTexts[indicatorName][
        this.country.countryCodeISO3
      ]
        ? this.country.countryCodeISO3
        : 'UGA';
      popoverText = this.popoverTexts[indicatorName][countryCodeToUse];
    }
    return popoverText;
  }

  public getAggregate(
    indicatorName: IbfLayerName,
    weightedAvg: boolean,
    numberFormat: NumberFormat,
  ) {
    return this.aggregatesService.getAggregate(
      weightedAvg,
      indicatorName,
      this.placeCode ? this.placeCode.placeCode : null,
      numberFormat,
    );
  }

  public getHeaderLabel() {
    let headerLabel = this.defaultHeaderLabel;

    if (this.placeCode) {
      headerLabel = this.placeCode.placeCodeName;
    } else {
      if (this.country) {
        if (this.eventService.state.activeTrigger) {
          const areaCount = this.aggregatesService.nrTriggeredAreas;
          const adminAreaLabel = this.country.adminRegionLabels[
            this.adminLevelService.adminLevel
          ][areaCount > 1 ? 'plural' : 'singular'];
          headerLabel = `${areaCount} ${this.exposedPrefix} ${adminAreaLabel}`;
        } else {
          headerLabel = `${this.allPrefix} ${this.country.countryName}`;
        }
      }
    }

    return headerLabel;
  }

  public clearPlaceCode() {
    this.placeCodeService.clearPlaceCode();
  }
}
