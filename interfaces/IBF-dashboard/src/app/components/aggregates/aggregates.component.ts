import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { SourceInfoModalComponent } from 'src/app/components/source-info-modal/source-info-modal.component';
import { Country } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { EapActionsService } from 'src/app/services/eap-actions.service';
import { EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import {
  Indicator,
  IndicatorGroup,
  NumberFormat,
} from 'src/app/types/indicator-group';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent implements OnInit, OnDestroy {
  public indicators: Indicator[] = [];
  public groups: IndicatorGroup[] = [];
  public placeCode: PlaceCode;
  private country: Country;
  private aggregateComponentTranslateNode = 'aggregates-component';
  private defaultHeaderLabelTranslateNode = 'default-header-label';
  private exposedPrefixTranslateNode = 'exposed-prefix';
  private allPrefixTranslateNode = 'all-prefix';
  private popoverTranslateNode = 'popover';

  public indicatorGroupEnum = IndicatorGroup;
  private triggeredAreas: any[];

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
    private modalController: ModalController,
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

    this.eapActionSubscription = this.eapActionsService
      .getTriggeredAreas()
      .subscribe(this.onTriggeredAreasChange);
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

    const typecastIndicatorGroup = (indicator: Indicator) => {
      indicator.group = IndicatorGroup[indicator.group];
    };
    this.indicators.forEach(typecastIndicatorGroup);

    this.groups = [];

    for (const group in IndicatorGroup) {
      if (IndicatorGroup[group]) {
        const indicatorGroup = IndicatorGroup[group];

        const filterIndicatorByIndicatorGroup = (indicator: Indicator) =>
          indicator.group === indicatorGroup;

        if (this.indicators.find(filterIndicatorByIndicatorGroup)) {
          this.groups.push(indicatorGroup);
        }
      }
    }
  };

  private onTriggeredAreasChange = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
  };

  public async moreInfo(indicator: Indicator): Promise<void> {
    const modal = await this.modalController.create({
      component: SourceInfoModalComponent,
      cssClass: 'source-info-modal-class',
      componentProps: {
        indicator,
        text: this.getPopoverText(indicator.name),
      },
    });

    this.analyticsService.logEvent(AnalyticsEvent.aggregateInformation, {
      indicator: indicator.name,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    modal.present();
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
          const adminAreaLabel = this.country.adminRegionLabels[
            this.adminLevelService.adminLevel
          ].plural;
          headerLabel = `${this.triggeredAreas.length} ${this.exposedPrefix} ${adminAreaLabel}`;
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
