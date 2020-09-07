import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SourceInfoModalPage } from 'src/app/pages/source-info-modal/source-info-modal.page';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-aggregates',
  templateUrl: './aggregates.component.html',
  styleUrls: ['./aggregates.component.scss'],
})
export class AggregatesComponent {
  public indicators: any[];
  constructor(
    public aggregatesService: AggregatesService,
    public mapService: MapService,
    public modalController: ModalController,
  ) {
    this.indicators = [
      {
        name: 'population_affected',
        label: 'Total Exposed Population',
        active: true,
      },
      {
        name: 'population',
        label: 'Total Population',
        active: false,
      },
    ];
  }

  ngOnInit() {}

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
