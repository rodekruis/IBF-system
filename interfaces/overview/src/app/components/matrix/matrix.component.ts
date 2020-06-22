import { Component, OnInit } from '@angular/core';
import { Layer, MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
})
export class MatrixComponent implements OnInit {
  public layers: Layer[];

  constructor(private mapService: MapService) {
    this.layers = this.mapService.state.layers;
  }

  ngOnInit() {}

  public updateLayer(id: string, state: boolean): void {
    this.mapService.setLayerState(id, state);
  }
}
