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
import { Country } from 'src/app/models/country.model';
import { Station } from 'src/app/models/station.model';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
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
  public layers: IbfLayer[] = [];

  private layerSubscription: Subscription;
  private countrySubscription: Subscription;
  private timelineSubscription: Subscription;

  private osmTileLayer = tileLayer(
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">Carto</a>',
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

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    public mapService: MapService,
  ) {
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

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.mapService.loadStationLayer();
        this.mapService.loadAdminRegionLayer();
        this.mapService.loadFloodExtentLayer();
        this.mapService.loadPopulationGridLayer();
        this.mapService.loadCroplandLayer();
        this.mapService.loadGrasslandLayer();
      });

    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe((timeline: string) => {
        this.mapService.loadStationLayer();
        this.mapService.loadAdminRegionLayer();
        this.mapService.loadFloodExtentLayer();
      });
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
    this.timelineSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
  }

  onMapReady(map: Map) {
    this.map = map;

    // Trigger a resize to fill the container-element:
    window.setTimeout(() => window.dispatchEvent(new UIEvent('resize')), 200);
  }

  private createLayer(layer: IbfLayer): IbfLayer {
    if (layer.type === IbfLayerType.point) {
      layer.leafletLayer = this.createPointLayer(layer);
    }

    if (layer.name === IbfLayerName.adminRegions) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);
    }

    if (layer.type === IbfLayerType.wms) {
      layer.leafletLayer = this.createWmsLayer(layer.wms);
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
        layer.defaultColorProperty,
      ),
    });
  }

  private createWmsLayer(layerWMS: IbfLayerWMS): Layer {
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
