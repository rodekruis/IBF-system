import { Component, OnDestroy } from '@angular/core';
import { MenuController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import {
  IbfLayer,
  IbfLayerGroup,
  IbfLayerName,
  IbfLayerType,
} from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  standalone: false,
})
export class MatrixComponent implements OnDestroy {
  private layerSubscription: Subscription;
  public layers: IbfLayer[] = [];
  public IbfLayerType = IbfLayerType;
  public IbfLayerName = IbfLayerName;
  public IbfLayerGroup = IbfLayerGroup;
  public hideLayerControlToggleButton = false;

  private BUTTON_HEIGHT = 2.26;
  private LINE_HEIGHT = 1.5;

  public isLayerMenuOpen = false;

  constructor(
    private analyticsService: AnalyticsService,
    public eventService: EventService,
    private mapService: MapService,
    private popoverController: PopoverController,
    private menuController: MenuController,
  ) {
    this.layerSubscription = this.mapService
      .getLayerSubscription()
      .subscribe(this.onLayerChange);
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
  }

  private onLayerChange = (newLayer: IbfLayer) => {
    if (newLayer && newLayer.name === IbfLayerName.alertThreshold) {
      return;
    }

    if (newLayer) {
      const newLayerIndex = this.layers.findIndex(
        (layer) => layer.name === newLayer.name,
      );
      if (newLayerIndex >= 0) {
        this.layers.splice(newLayerIndex, 1, newLayer);
      } else {
        this.isLayerMenuOpen = false;
        if (newLayer.group !== IbfLayerGroup.adminRegions) {
          this.layers.push(newLayer);
        }
      }
    } else {
      this.layers = [];
    }
  };

  async presentPopover(event: Event, layer: IbfLayer): Promise<void> {
    event.stopPropagation();

    const popover = await this.popoverController.create({
      component: LayerControlInfoPopoverComponent,
      animated: true,
      cssClass: `ibf-popover ibf-popover-normal ${
        this.eventService.state.forecastTrigger ? 'trigger-alert' : 'no-alert'
      }`,
      translucent: true,
      showBackdrop: true,
      componentProps: { layer },
    });

    this.analyticsService.logEvent(AnalyticsEvent.mapLayerInformation, {
      mapLayerName: layer.name,
      mapLayerStatus: layer.active,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    void popover.present();
  }

  public toggleLayer(layer: IbfLayer): void {
    this.analyticsService.logEvent(AnalyticsEvent.mapLayer, {
      mapLayerName: layer.name,
      mapLayerStatus: !layer.active,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.events?.length > 0,
      component: this.constructor.name,
    });

    this.mapService.toggleLayer(layer);
  }

  public async isLayerControlMenuOpen(): Promise<void> {
    this.hideLayerControlToggleButton =
      await this.menuController.isOpen('layer-control');
  }

  private sortLayers = (a: IbfLayer, b: IbfLayer) =>
    a.order > b.order ? 1 : a.order === b.order ? 0 : -1;

  getLayersInOrder(): IbfLayer[] {
    // Filter out layers with negative order-value (quick hack)
    return this.layers
      .filter((layer) => layer.order >= 0)
      .sort(this.sortLayers);
  }

  public isCheckBox(layerGroup: IbfLayerGroup): boolean {
    return [IbfLayerGroup.point, IbfLayerGroup.wms].includes(layerGroup);
  }

  public isRadioButton(layerGroup: IbfLayerGroup): boolean {
    return [IbfLayerGroup.aggregates, IbfLayerGroup.outline].includes(
      layerGroup,
    );
  }

  public toggleLayerMenu(): void {
    this.isLayerMenuOpen = !this.isLayerMenuOpen;
  }

  public getLayerMenuContainerHeightInRem = (): number => {
    if (!this.isLayerMenuOpen) {
      return this.BUTTON_HEIGHT;
    }
    return (
      (this.getLayersInOrder().length + 1) * this.LINE_HEIGHT +
      this.BUTTON_HEIGHT
    );
  };
}
