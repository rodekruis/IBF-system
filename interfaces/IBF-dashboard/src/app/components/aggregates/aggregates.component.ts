import { Component, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SourceInfoModalComponent } from 'src/app/components/source-info-modal/source-info-modal.component';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { CountryService } from 'src/app/services/country.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { Indicator, IndicatorGroup } from '../../types/indicator-group';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent implements OnDestroy {
  public indicators: Indicator[];
  public groups: IndicatorGroup[];

  private indicatorSubscription: Subscription;
  private countrySubscription: Subscription;
  private timelineSubscription: Subscription;

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    public aggregatesService: AggregatesService,
    public modalController: ModalController,
  ) {
    if (
      this.countryService.selectedCountry &&
      this.timelineService.state.selectedTimeStepButtonValue
    ) {
      this.aggregatesService.loadMetadata();
      this.aggregatesService.loadAggregateInformation();
    }

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country) => {
        this.aggregatesService.loadMetadata();
        this.aggregatesService.loadAggregateInformation();
      });

    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe((timeline) => {
        this.aggregatesService.loadMetadata();
        this.aggregatesService.loadAggregateInformation();
      });

    this.groups = [IndicatorGroup.general, IndicatorGroup.vulnerability];
    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe((newIndicators: Indicator[]) => {
        this.indicators = newIndicators;
        this.indicators.forEach((indicator: Indicator) => {
          indicator.group = IndicatorGroup[indicator.group];
        });
      });
  }

  ngOnDestroy() {
    this.indicatorSubscription.unsubscribe();
    this.timelineSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
  }

  public async moreInfo(indicator: Indicator) {
    const modal = await this.modalController.create({
      component: SourceInfoModalComponent,
      cssClass: 'source-info-modal-class',
      componentProps: { indicator },
    });
    return await modal.present();
  }
}
