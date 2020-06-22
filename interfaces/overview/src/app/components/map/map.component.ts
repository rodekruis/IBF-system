import { Component, OnInit } from '@angular/core';
import { Station } from 'src/app/models/station.model';
import { Layer, MapService } from 'src/app/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  public layers: Layer[];
  public stations: Station[];

  constructor(private mapService: MapService) {
    this.layers = this.mapService.state.layers;
  }

  ngOnInit() {}
}
