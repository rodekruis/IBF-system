import { Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import {
  Control,
  divIcon,
  DomUtil,
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
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel } from 'src/app/types/admin-level.enum';
import { IbfLayer } from 'src/app/types/ibf-layer';
import { IbfLayerName } from 'src/app/types/ibf-layer-name';
import { IbfLayerType } from 'src/app/types/ibf-layer-type';
import { IbfLayerWMS } from 'src/app/types/ibf-layer-wms';
import { IndicatorEnum } from 'src/app/types/indicator-group';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnDestroy {
  private map: Map;
  public layers: IbfLayer[] = [];

  public legend: Control;

  private layerSubscription: Subscription;
  private countrySubscription: Subscription;
  private adminLevelSubscription: Subscription;
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
    popupAnchor: [0, -30],
    iconUrl: 'assets/markers/default.svg',
    iconRetinaUrl: 'assets/markers/default.svg',
  };

  private iconWarning: IconOptions = {
    ...this.iconDefault,
    iconSize: [35, 56],
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
    private adminLevelService: AdminLevelService,
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

    this.adminLevelSubscription = this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe((adminLevel: AdminLevel) => {
        this.mapService.loadAdminRegionLayer();
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
    this.adminLevelSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
  }

  public addLegend(map, colors, colorThreshold, layerActive) {
    if (this.legend) {
      map.removeControl(this.legend);
    }

    if (layerActive) {
      this.legend = new Control();
      this.legend.setPosition('bottomleft');
      this.legend.onAdd = function (map) {
        const div = DomUtil.create('div', 'info legend');
        const grades = [
          0,
          colorThreshold[0.2],
          colorThreshold[0.4],
          colorThreshold[0.6],
          colorThreshold[0.8],
        ];

        const getColor = function (d) {
          return d > colorThreshold[0.8]
            ? colors[4]
            : d > colorThreshold[0.6]
            ? colors[3]
            : d > colorThreshold[0.4]
            ? colors[2]
            : d > colorThreshold[0.2]
            ? colors[1]
            : colors[0];
        };

        // This is now done based on number distribution, but better to infer from metadata (aggregates-service)
        const numberFormat = function (d) {
          const cutoff = colorThreshold[0.8];
          if (cutoff <= 1) {
            return Math.round(d * 100) + '%';
          } else if (cutoff <= 10) {
            return Math.round(d * 100) / 100;
          } else {
            return Math.round(d);
          }
        };

        for (let i = 0; i < grades.length; i++) {
          if (i === 0 || grades[i] > grades[i - 1]) {
            div.innerHTML +=
              '<i style="background:' +
              getColor(grades[i] + 0.0001) +
              '"></i> ' +
              numberFormat(grades[i]) +
              (typeof grades[i + 1] !== 'undefined'
                ? '&ndash;' + numberFormat(grades[i + 1]) + '<br/>'
                : '+');
          }
        }

        return div;
      };

      this.legend.addTo(map);
    }
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

      const colors = this.mapService.state.colorGradient;
      const colorThreshold = this.mapService.getColorThreshold(
        layer.data,
        layer.colorProperty,
      );
      this.addLegend(this.map, colors, colorThreshold, layer.active);
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
        layer.colorProperty,
      ),
      onEachFeature: function (feature, element) {
        element.on('click', function () {
          if (
            layer.colorProperty === IndicatorEnum.PopulationExposed &&
            feature.properties[layer.colorProperty] > 0
          ) {
            const popup =
              '<strong>' +
              feature.properties.name +
              '</strong><br/>' +
              'Population exposed: ' +
              Math.round(feature.properties[IndicatorEnum.PopulationExposed]) +
              '';
            element.bindPopup(popup).openPopup();
          }
        });
      },
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

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: markerIcon
        ? icon(markerIcon)
        : divIcon(),
    });
    markerInstance.bindPopup(this.createMarkerPopup(markerProperties));

    return markerInstance;
  }

  private createMarkerPopup(markerProperties) {
    // DUMMY: REMOVE FOR PRODUCTION
    if (markerProperties.fc == 0) markerProperties.fc = 100;

    const percentageTrigger =
      markerProperties.fc / markerProperties.trigger_level;
    const color = percentageTrigger < 1 ? '#a5d4a1' : '#d7301f';

    const fullWidth = 50;

    const stationInfoPopup =
      '<div style="margin-bottom: 5px">' +
      '<strong>' +
      markerProperties.station_name +
      '</strong>' +
      ' (' +
      markerProperties.station_code +
      ')' +
      '</div>' +
      '<div style="margin-bottom: 5px">' +
      'Forecast: ' +
      '<span style="color:' +
      color +
      '">' +
      Math.round(markerProperties.fc) +
      ' m<sup>3</sup>/s' +
      '</span>' +
      '<div style="border-radius:5px;height:12px;background-color:' +
      color +
      '; width: ' +
      Math.max(
        Math.min(
          Math.round(
            (markerProperties.fc / markerProperties.trigger_level) * fullWidth,
          ),
          fullWidth,
        ),
        0,
      ) +
      '%"></div>' +
      '</div>' +
      '<div>Trigger : ' +
      Math.round(markerProperties.trigger_level) +
      ' m<sup>3</sup>/s' +
      '<div style="border-radius:5px;height:12px;background-color:grey;width:' +
      fullWidth +
      '%"></div>' +
      '</div>';
    return stationInfoPopup;
  }
}
