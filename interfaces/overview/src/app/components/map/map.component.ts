import { Component, OnInit } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import {
  icon,
  latLng,
  LatLng,
  layerGroup,
  Map,
  MapOptions,
  marker,
  tileLayer,
} from 'leaflet';
import { MapService } from 'src/app/services/map.service';
import { IbfLayer } from 'src/app/types/ibf-layer';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  public layers: IbfLayer[];

  // Define our base layers so we can reference them multiple times
  private hotTileLayer = tileLayer(
    'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
    },
  );

  private osmTileLayer = tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  );

  private defaultIcon = icon({
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/leaflet/marker-icon.png',
    iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  });

  private testMarkers;

  public leafletOptions: MapOptions = {
    zoom: 5,
    center: latLng(-12.823, 29.268),
    layers: [this.hotTileLayer],
  };

  public leafletLayersControl: LeafletControlLayersConfig = {
    baseLayers: {
      'OpenStreetMap default': this.osmTileLayer,
      'Humanitairian OpenStreetMap': this.hotTileLayer,
    },
    overlays: {},
  };

  constructor(private mapService: MapService) {
    this.layers = this.mapService.state.layers;
  }

  ngOnInit() {}

  onMapReady(map: Map) {
    // Trigger a resize to fill the container-element:
    window.dispatchEvent(new UIEvent('resize'));

    this.debugPutMarkersOnTheMap(map);
  }

  private createMarker(markerTitle: string, markerLatLng: LatLng) {
    return marker(markerLatLng, {
      title: markerTitle,
      icon: this.defaultIcon,
    });
  }
  private createMarkerLayer(markers: any[]) {
    return layerGroup(markers);
  }

  private debugPutMarkersOnTheMap(map: Map) {
    const testMarkers = this.createMarkerLayer([
      this.createMarker('test marker 1', latLng(-14, 27)),
      this.createMarker('test marker 2', latLng(-15, 28)),
    ]);

    this.leafletLayersControl.overlays['test markers'] = testMarkers;
    map.addLayer(testMarkers);
  }
}
