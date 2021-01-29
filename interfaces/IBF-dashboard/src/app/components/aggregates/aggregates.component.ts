import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SourceInfoModalComponent } from 'src/app/components/source-info-modal/source-info-modal.component';
import { Country } from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
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
  private country: Country;
  private defaultHeaderLabel: string = 'Loading';

  private indicatorSubscription: Subscription;
  private countrySubscription: Subscription;
  private timelineSubscription: Subscription;
  private placeCodeSubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    private aggregatesService: AggregatesService,
    private placeCodeService: PlaceCodeService,
    private modalController: ModalController,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (
      this.countryService.activeCountry &&
      this.timelineService.activeLeadTime
    ) {
      this.aggregatesService.loadMetadata();
      this.aggregatesService.loadAggregateInformation();
    }

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.country = country;
        this.aggregatesService.loadMetadata();
        this.aggregatesService.loadAggregateInformation();
      });

    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe((timeline) => {
        this.aggregatesService.loadMetadata();
        this.aggregatesService.loadAggregateInformation();
      });

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe((placeCode: PlaceCode) => {
        this.placeCode = placeCode;
        this.changeDetectorRef.detectChanges();
      });

    this.groups = [IndicatorGroup.general, IndicatorGroup.vulnerability];
    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe((newIndicators: Indicator[]) => {
        this.indicators = newIndicators.filter((i) => i.aggregateIndicator);
        this.indicators.forEach((indicator: Indicator) => {
          indicator.group = IndicatorGroup[indicator.group];
        });
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
      componentProps: { indicator },
    });
    return await modal.present();
  }

  public getAggregate(indicatorName, weightedAvg) {
    return this.aggregatesService.getAggregate(
      indicatorName,
      weightedAvg,
      this.placeCode ? this.placeCode.placeCode : null,
    );
  }

  public getHeaderLabel() {
    return this.placeCode
      ? this.placeCode.placeCodeName
      : this.country
      ? this.country.countryName
      : this.defaultHeaderLabel;
  }

  public clearPlaceCode() {
    this.placeCodeService.clearPlaceCode();
  }
}
