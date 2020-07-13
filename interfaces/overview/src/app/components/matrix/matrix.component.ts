import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import { IbfLayer } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
})
export class MatrixComponent implements OnInit {
  public layers: IbfLayer[];

  constructor(private mapService: MapService) {
    this.layers = this.mapService.state.layers;
  }

  ngOnInit() {}

  public updateLayer(name: string, state: boolean): void {
    this.mapService.setLayerState(name, state);
  }
}
