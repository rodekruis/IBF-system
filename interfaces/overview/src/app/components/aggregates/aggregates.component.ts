import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SourceInfoModalPage } from 'src/app/pages/source-info-modal/source-info-modal.page';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { MapService } from 'src/app/services/map.service';
import { Indicator, IndicatorGroup, NumberFormat } from '../../types/indicator-group';

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
    this.indicators = [
      {
        name: 'population_affected',
        label: 'Total Exposed Population',
        icon: 'Affected-population-white.svg',
        active: true,
        numberFormat: NumberFormat.dec0,
        group: IndicatorGroup.general,
      },
      {
        name: 'population',
        label: 'Total Population',
        icon: 'Person1-white.svg',
        active: false,
        numberFormat: NumberFormat.dec0,
        group: IndicatorGroup.general,
      },
      {
        name: 'vulnerability_index',
        label: 'Weighted Vulnerability Index',
        icon: 'population_affected-white.svg',
        active: false,
        numberFormat: NumberFormat.dec2,
        group: IndicatorGroup.vulnerability,
      },
      {
        name: 'poverty_incidence',
        label: 'Poverty incidence',
        icon: 'Poverty-white.svg',
        active: false,
        numberFormat: NumberFormat.perc,
        group: IndicatorGroup.vulnerability,
      },
      {
        name: 'female_head_hh',
        label: 'Female-headed households',
        icon: 'Person2-white.svg',
        active: false,
        numberFormat: NumberFormat.perc,
        group: IndicatorGroup.vulnerability,
      },
      {
        name: 'population_u8',
        label: 'Population under 8',
        icon: 'Children-white.svg',
        active: false,
        numberFormat: NumberFormat.perc,
        group: IndicatorGroup.vulnerability,
      },
      {
        name: 'population_over65',
        label: 'Population over 65',
        icon: 'Elderly-white.svg',
        active: false,
        numberFormat: NumberFormat.perc,
        group: IndicatorGroup.vulnerability,
      },
      {
        name: 'wall_type',
        label: 'Permanent Wall type',
        icon: 'House-white.svg',
        active: false,
        numberFormat: NumberFormat.perc,
        group: IndicatorGroup.vulnerability,
      },
      {
        name: 'roof_type',
        label: 'Permanent roof type',
        icon: 'House-white.svg',
        active: false,
        numberFormat: NumberFormat.perc,
        group: IndicatorGroup.vulnerability,
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
