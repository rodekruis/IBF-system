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
import { TimelineService } from 'src/app/services/timeline.service';
import { IbfLayerName } from 'src/app/types/ibf-layer';
import { Indicator, IndicatorGroup } from 'src/app/types/indicator-group';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent implements OnInit, OnDestroy {
  public indicators: Indicator[] = [];
  public groups: IndicatorGroup[] = [];
  public placeCode: PlaceCode;

  public indicatorGroupEnum = IndicatorGroup;

  private defaultHeaderLabel: string;
  private exposedPrefix: string;
  private allPrefix: string;
  private popoverTexts: { [key: string]: string } = {};

  private indicatorSubscription: Subscription;
  private countrySubscription: Subscription;
  private timelineSubscription: Subscription;
  private placeCodeSubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
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
    this.translateService
      .get('aggregates-component')
      .subscribe((translatedStrings: object) => {
        this.defaultHeaderLabel = translatedStrings['default-header-label'];
        this.exposedPrefix = translatedStrings['exposed-prefix'];
        this.allPrefix = translatedStrings['all-prefix'];
        this.popoverTexts = translatedStrings['popover'];
      });
  }

  ngOnInit() {
    this.aggregatesService.loadMetadataAndAggregates();

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (country) {
          this.aggregatesService.loadMetadataAndAggregates();
        }
      });

    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe(() => {
        this.aggregatesService.loadMetadataAndAggregates();
      });

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((placeCode: PlaceCode) => {
        this.placeCode = placeCode;
        this.changeDetectorRef.detectChanges();
      });

    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe((newIndicators: Indicator[]) => {
        this.indicators = newIndicators.filter((i) => i.aggregateIndicator);
        this.indicators.forEach((indicator: Indicator) => {
          indicator.group = IndicatorGroup[indicator.group];
        });
        this.groups = [];
        for (let group in IndicatorGroup) {
          if (this.indicators.find((i) => i.group === IndicatorGroup[group])) {
            this.groups.push(IndicatorGroup[group]);
          }
        }
      });
  }

  ngOnDestroy() {
    this.indicatorSubscription.unsubscribe();
    this.timelineSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
  }

  public async moreInfo(indicator: Indicator) {
    const modal = await this.modalController.create({
      component: SourceInfoModalComponent,
      cssClass: 'source-info-modal-class',
      componentProps: {
        indicator,
        text: this.getPopoverText(indicator.name),
      },
    });

    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.analyticsService.logEvent(AnalyticsEvent.aggregateInformation, {
          indicator: indicator.name,
          page: AnalyticsPage.dashboard,
          country: country.countryCodeISO3,
          isActiveEvent: this.eventService.state.activeEvent,
          isActiveTrigger: this.eventService.state.activeTrigger,
          component: this.constructor.name,
        });
      });

    return await modal.present();
  }

  private getPopoverText(indicatorName: IbfLayerName): string {
    const triggerState: string = this.eventService.state.activeTrigger
      ? `active-trigger-${this.eventService.disasterType}`
      : 'no-trigger';
    return this.popoverTexts[indicatorName][triggerState];
  }

  public getAggregate(indicatorName: IbfLayerName, weightedAvg: boolean) {
    return this.aggregatesService.getAggregate(
      weightedAvg,
      indicatorName,
      this.placeCode ? this.placeCode.placeCode : null,
    );
  }

  public getHeaderLabel() {
    let headerLabel = this.defaultHeaderLabel;

    this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        if (this.placeCode) {
          headerLabel = this.placeCode.placeCodeName;
        } else {
          if (country) {
            if (this.eventService.state.activeTrigger) {
              const adminAreaLabel =
                country.adminRegionLabels[
                  this.adminLevelService.adminLevel - 1
                ];
              this.eapActionsService
                .getTriggeredAreas()
                .subscribe((triggeredAreas) => {
                  headerLabel = `${triggeredAreas.length} ${this.exposedPrefix} ${adminAreaLabel}`;
                });
            } else {
              headerLabel = `${this.allPrefix} ${country.countryName}`;
            }
          }
        }
      });

    return headerLabel;
  }

  public clearPlaceCode() {
    this.placeCodeService.clearPlaceCode();
  }
}
