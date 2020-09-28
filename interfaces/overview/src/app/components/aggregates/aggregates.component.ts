import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { SourceInfoModalComponent } from 'src/app/components/source-info-modal/source-info-modal.component';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { MapService } from 'src/app/services/map.service';
import { Indicator, IndicatorGroup } from '../../types/indicator-group';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent {
  public indicators: Indicator[];
  private indicatorSubscription: Subscription;
  public groups: IndicatorGroup[];

  constructor(
    public aggregatesService: AggregatesService,
    public mapService: MapService,
    public modalController: ModalController,
  ) {
    this.aggregatesService.loadMetadata();
    this.aggregatesService.loadAggregateInformation();

    this.groups = [IndicatorGroup.general, IndicatorGroup.vulnerability];
    this.indicatorSubscription = this.aggregatesService
      .getIndicators()
      .subscribe((newIndicators) => {
        this.indicators = newIndicators;
        this.indicators.forEach((i) => {
          i.group = IndicatorGroup[i.group];
        });
      });
  }

  ngOnDestroy() {
    this.indicatorSubscription.unsubscribe();
  }

  public changeIndicator(indicator) {
    this.indicators.forEach((i) => (i.active = false));
    this.indicators.find((i) => i.name === indicator).active = true;
    this.mapService.updateAdminRegionLayer(indicator);
  }

  public async moreInfo(indicator) {
    const modal = await this.modalController.create({
      component: SourceInfoModalComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        indicator: indicator,
      },
    });
    return await modal.present();
  }
}
