import { Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import {
  geoJSON,
  icon,
  IconOptions,
  latLng,
  LatLng,
  Layer,
  Map,
  MapOptions,
  marker,
  Marker,
  tileLayer,
} from 'leaflet';
import { Subscription } from 'rxjs';
import { Station } from 'src/app/models/station.model';
import { MapService } from 'src/app/services/map.service';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnDestroy {
  private map: Map;
  private layerSubscription: Subscription;
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

  private iconDefault: IconOptions = {
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    iconUrl: 'assets/markers/default.png',
    iconRetinaUrl: 'assets/markers/default-2x.png',
  };
  private iconWarning: IconOptions = {
    ...this.iconDefault,
    iconUrl: 'assets/markers/alert.svg',
    iconRetinaUrl: 'assets/markers/alert.svg',
  };

  public leafletOptions: MapOptions = {
    zoom: 5,
    layers: [this.osmTileLayer],
  };

  public leafletLayersControl: LeafletControlLayersConfig = {
    baseLayers: {},
    overlays: {},
  };

  constructor(public mapService: MapService) {
    this.layerSubscription = this.mapService
      .getLayers()
      .subscribe((newLayer) => {
        if (newLayer) {
          const newLayerIndex = this.layers.findIndex(
            (layer) => layer.name === newLayer.name,
          );
          newLayer = this.createLayer(newLayer);
          if (newLayerIndex >= 0) {
            this.layers.splice(newLayerIndex, 1, newLayer);
          } else {
            this.layers.push(newLayer);
          }
        } else {
          this.layers = [];
        }
        this.addToLayersControl();
        this.map.panTo(this.mapService.state.center);
      });
    this.leafletOptions.center = latLng(this.mapService.state.center);
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
  }

  async onMapReady(map: Map) {
    this.map = map;

    // Trigger a resize to fill the container-element:
    window.setTimeout(() => window.dispatchEvent(new UIEvent('resize')), 200);

    await this.mapService.loadData();
  }

  private createLayer(layer: IbfLayer): IbfLayer {
    if (layer.type === IbfLayerType.point) {
      layer.leafletLayer = this.createPointLayer(layer);
    }

    if (layer.name === IbfLayerName.adminRegions) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);
    }

    return layer;
  }

  private addToLayersControl(): void {
    this.layers.forEach((layer) => {
      this.leafletLayersControl.overlays[layer.name] = layer.leafletLayer;
    });
  }

  private createPointLayer(layer: IbfLayer): Layer {
    if (!layer.data) {
      return;
    }
    return geoJSON(layer.data, {
      pointToLayer: (geoJsonPoint: GeoJSON.Feature, latlng: LatLng) => {
        switch (layer.name) {
          case IbfLayerName.waterStations:
            return this.createMarkerStation(
              geoJsonPoint.properties as Station,
              latlng,
            );
          default:
            return this.createMarkerDefault(latlng);
        }
      },
    });
  }

  private createAdminRegionsLayer(layer: IbfLayer): Layer {
    if (!layer.data) {
      return;
    }

    return geoJSON(layer.data, {
      style: this.mapService.setAdminRegionStyle(
        layer.data,
        this.mapService.state.defaultColorProperty,
      ),
    });
  }

  private createMarkerDefault(markerLatLng: LatLng): Marker {
    return marker(markerLatLng, {
      icon: icon(this.iconDefault),
    });
  }

  private createMarkerStation(
    markerProperties: Station,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.station_name;
    let markerIcon = this.iconDefault;

    if (markerProperties.fc_trigger === '1') {
      markerIcon = this.iconWarning;
    }

    return marker(markerLatLng, {
      title: markerTitle,
      icon: icon(markerIcon),
    });
  }
}
