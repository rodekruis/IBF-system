import { Component, OnDestroy } from '@angular/core';
import { MenuController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LayerControlInfoPopoverComponent } from 'src/app/components/layer-control-info-popover/layer-control-info-popover.component';
import { MapService } from 'src/app/services/map.service';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
})
export class MatrixComponent implements OnDestroy {
  private layerSubscription: Subscription;
  public layers: IbfLayer[] = [];
  public IbfLayerType = IbfLayerType;
  public showLayerControlToggleButton: boolean = true;

  constructor(
    private mapService: MapService,
    private popoverController: PopoverController,
    private menuController: MenuController,
  ) {
    this.layerSubscription = this.mapService
      .getLayers()
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

  async presentPopover(event: any, layer: IbfLayer) {
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

    return await popover.present();
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
  }

  public updateLayer(name: string, state: boolean): void {
    this.mapService.setLayerState(name, state);
  }

  public isLayerControlMenuOpen() {
    this.menuController.isOpen('layer-control').then((state) => {
      this.showLayerControlToggleButton = state;
    });
  }
}
