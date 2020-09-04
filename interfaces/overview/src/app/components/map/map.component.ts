import { Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import {
  geoJSON,
  icon,
  IconOptions,
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
import { IbfLayerWMS } from 'src/app/types/ibf-layer-wms';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnDestroy {
  private map: Map;
  private layerSubscription: Subscription;
  public layers: IbfLayer[] = [];

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
        if (newLayer.viewCenter) {
          this.map.fitBounds(this.mapService.state.bounds);
        }
      });
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
  }

  async onMapReady(map: Map) {
    this.map = map;

    // Trigger a resize to fill the container-element:
    window.setTimeout(() => window.dispatchEvent(new UIEvent('resize')), 200);

    await this.mapService.loadAdminRegionLayer();
    await this.mapService.loadStationLayer();
    await this.mapService.loadFloodExtentLayer();
    await this.mapService.loadPopulationGridLayer();
  }

  private createLayer(layer: IbfLayer): IbfLayer {
    if (layer.type === IbfLayerType.point) {
      layer.leafletLayer = this.createPointLayer(layer);
    }

    if (layer.name === IbfLayerName.adminRegions) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);
    }

    if (layer.name === IbfLayerName.floodExtent) {
      layer.leafletLayer = this.createFloodExtentLayer(layer.wms);
    }

    if (layer.name === IbfLayerName.populationGrid) {
      layer.leafletLayer = this.createFloodExtentLayer(layer.wms);
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
          case IbfLayerName.glofasStations:
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

  private createFloodExtentLayer(layerWMS: IbfLayerWMS): Layer {
    if (!layerWMS) {
      return;
    }
    return tileLayer.wms(layerWMS.url, {
      layers: layerWMS.name,
      format: layerWMS.format,
      version: layerWMS.version,
      attribution: layerWMS.attribution,
      crs: layerWMS.crs,
      transparent: layerWMS.transparent,
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
