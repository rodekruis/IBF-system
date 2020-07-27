import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MapService } from 'src/app/services/map.service';
import { IbfLayer } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
})
export class MatrixComponent implements OnDestroy {
  private layerSubscription: Subscription;
  public layers: IbfLayer[];

  constructor(public mapService: MapService) {
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
            this.layers.push(newLayer);
          }
        } else {
          this.layers = [];
        }
      });
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
  }

  public updateLayer(name: string, state: boolean): void {
    this.mapService.setLayerState(name, state);
  }
}
