import { Component, OnInit } from '@angular/core';
import { latLng, Map, tileLayer } from 'leaflet';
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

  public leafletOptions = {
    zoom: 5,
    center: latLng(-12.823, 29.268),
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
      }),
    ],
  };

  constructor(private mapService: MapService) {
    this.layers = this.mapService.state.layers;
  }

  ngOnInit() {}

  onMapReady(map: Map) {
    // Trigger a resize to fill the container-element:
    window.dispatchEvent(new UIEvent('resize'));
  }
}
