import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SourceInfoModalPage } from 'src/app/pages/source-info-modal/source-info-modal.page';
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
  public groups: IndicatorGroup[];

  constructor(
    public aggregatesService: AggregatesService,
    public mapService: MapService,
    public modalController: ModalController,
  ) {
    this.groups = [IndicatorGroup.general, IndicatorGroup.vulnerability];
  }

  async ngOnInit() {
    this.indicators = await this.aggregatesService.getMetadata();
    this.indicators.forEach((i) => {
      i.group = IndicatorGroup[i.group];
    });
  }

  public changeIndicator(indicator) {
    this.indicators.forEach((i) => (i.active = false));
    this.indicators.find((i) => i.name === indicator).active = true;
    this.mapService.updateAdminRegionLayer(indicator);
  }

  public async moreInfo(indicator) {
    const modal = await this.modalController.create({
      component: SourceInfoModalPage,
      cssClass: 'my-custom-class',
      componentProps: {
        indicator: indicator,
      },
    });
    return await modal.present();
  }
}
