import { Component, OnDestroy } from '@angular/core';
import { MenuController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { AggregatesService } from 'src/app/services/aggregates.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { IbfLayer, IbfLayerName, IbfLayerType } from 'src/app/types/ibf-layer';
import { AdminLevelService } from '../../services/admin-level.service';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
})
export class MatrixComponent implements OnDestroy {
  private layerSubscription: Subscription;
  public layers: IbfLayer[] = [];
  public IbfLayerType = IbfLayerType;
  public IbfLayerName = IbfLayerName;
  public hideLayerControlToggleButton: boolean = false;

  constructor(
    private analyticsService: AnalyticsService,
    private eventService: EventService,
    private mapService: MapService,
    private adminLevelService: AdminLevelService,
    private popoverController: PopoverController,
    private menuController: MenuController,
    private aggregatesService: AggregatesService,
  ) {
    this.layerSubscription = this.mapService
      .getLayerSubscription()
      .subscribe((newLayer) => {
        if (newLayer) {
          const newLayerIndex = this.layers.findIndex(
            (layer) => layer.name === newLayer.name,
          );
          if (newLayerIndex >= 0) {
            this.layers.splice(newLayerIndex, 1, newLayer);
          } else {
            if (newLayer.name !== IbfLayerName.adminRegions)
              this.layers.push(newLayer);
          }
        } else {
          this.layers = [];
        }
      });
  }

  async presentPopover(event: any, layer: IbfLayer): Promise<void> {
    event.stopPropagation();

    const popover = await this.popoverController.create({
      component: LayerControlInfoPopoverComponent,
      animated: true,
      cssClass: 'ibf-layer-control-popover',
      translucent: true,
      showBackdrop: true,
      componentProps: {
        layer: layer,
      },
    });

    this.analyticsService.logEvent(AnalyticsEvent.mapLayerInformation, {
      mapLayerName: layer.name,
      mapLayerStatus: layer.active,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    popover.present();
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
  }

  updateLayerClick(
    name: IbfLayerName,
    active: boolean,
    data: GeoJSON.FeatureCollection,
  ): void {
    this.analyticsService.logEvent(AnalyticsEvent.mapLayer, {
      mapLayerName: name,
      mapLayerStatus: active,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.updateLayer(name, active, data);
  }

  public updateLayer(
    name: IbfLayerName,
    active: boolean,
    data: GeoJSON.FeatureCollection,
  ): void {
    if (active && data && data.features.length === 0) {
      const indicator = this.aggregatesService.indicators.find(
        (o) => o.name === name,
      );
      this.mapService.loadAdmin2Data(indicator);
    }
    this.mapService.updateLayer(name, active, true);
    this.mapService.activeLayerName = active ? name : null;
    if (active) {
      this.mapService.layers.find(
        (l) => l.name === IbfLayerName.adminRegions,
      ).active = true;
    }
    if (active && !this.adminLevelService.adminLayerState) {
      this.adminLevelService.adminLayerState = true;
    }
  }

  public async isLayerControlMenuOpen(): Promise<void> {
    this.hideLayerControlToggleButton = await this.menuController.isOpen(
      'layer-control',
    );
  }

  getLayersInOrder(): IbfLayer[] {
    return this.layers.sort((a: IbfLayer, b: IbfLayer) =>
      a.order > b.order ? 1 : a.order === b.order ? 0 : -1,
    );
  }
}
