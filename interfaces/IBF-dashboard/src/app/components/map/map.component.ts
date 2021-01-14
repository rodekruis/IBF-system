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
import { RedcrossBranch, Station } from 'src/app/models/poi.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { LoaderService } from 'src/app/services/loader.service';
import { MapService } from 'src/app/services/map.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { AdminLevel } from 'src/app/types/admin-level.enum';
import {
  IbfLayer,
  IbfLayerGroup,
  IbfLayerName,
  IbfLayerType,
  IbfLayerWMS,
} from 'src/app/types/ibf-layer';
import { IndicatorName } from 'src/app/types/indicator-group';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnDestroy {
  private map: Map;
  public layers: IbfLayer[] = [];

  public legends: { [key: string]: Control } = {};

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

  private iconGlofasDefault: IconOptions = {
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [0, -30],
    iconUrl: 'assets/markers/glofas-default.svg',
    iconRetinaUrl: 'assets/markers/glofas-default.svg',
  };

  private iconGlofasWarning: IconOptions = {
    ...this.iconGlofasDefault,
    iconSize: [35, 56],
    iconUrl: 'assets/markers/glofas-alert.svg',
    iconRetinaUrl: 'assets/markers/glofas-alert.svg',
  };

  private iconRedcrossBranch: IconOptions = {
    ...this.iconGlofasDefault,
    iconSize: [20, 33],
    iconUrl: 'assets/markers/redcross.png',
    iconRetinaUrl: 'assets/markers/redcross.png',
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
    private loaderService: LoaderService,
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

          if (newLayer.viewCenter) {
            this.map.fitBounds(this.mapService.state.bounds);
          }
        } else {
          this.layers = [];
        }
        this.addToLayersControl();

        // Trigger a resize to fill the container-element:
        window.setTimeout(
          () => window.dispatchEvent(new UIEvent('resize')),
          200,
        );
      });

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe((country: Country) => {
        this.mapService.loadStationLayer();
        this.mapService.loadRedcrossBranchesLayer();
        this.mapService.loadAdminRegionLayer();
        this.mapService.loadFloodExtentLayer();
        this.mapService.loadPopulationGridLayer();
        this.mapService.loadCroplandLayer();
        this.mapService.loadGrasslandLayer();

        // Trigger a resize to fill the container-element:
        window.setTimeout(
          () => window.dispatchEvent(new UIEvent('resize')),
          200,
        );
      });

    this.adminLevelSubscription = this.adminLevelService
      .getAdminLevelSubscription()
      .subscribe((adminLevel: AdminLevel) => {
        this.mapService.loadAdminRegionLayer();

        // Trigger a resize to fill the container-element:
        window.setTimeout(
          () => window.dispatchEvent(new UIEvent('resize')),
          200,
        );
      });

    this.timelineSubscription = this.timelineService
      .getTimelineSubscription()
      .subscribe((timeline: string) => {
        this.mapService.loadStationLayer();
        this.mapService.loadRedcrossBranchesLayer();
        this.mapService.loadAdminRegionLayer();
        this.mapService.loadFloodExtentLayer();

        // Trigger a resize to fill the container-element:
        window.setTimeout(() => {
          window.dispatchEvent(new UIEvent('resize'));
          this.loaderService.setLoader(false);
        }, 200);
      });
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
    this.timelineSubscription.unsubscribe();
    this.adminLevelSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
  }

  public addLegend(map, colors, colorThreshold, layer: IbfLayer) {
    if (this.legends[layer.name]) {
      map.removeControl(this.legends[layer.name]);
    }

    if (layer.active) {
      this.legends[layer.name] = new Control();
      this.legends[layer.name].setPosition('bottomleft');
      this.legends[layer.name].onAdd = function (map) {
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

        div.innerHTML += `<div><b>${layer.label}</b></div>`;

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

      this.legends[layer.name].addTo(map);
    }
  }

  onMapReady(map: Map) {
    this.map = map;
    this.map.createPane('ibf-wms');
    this.map.createPane('ibf-aggregate');

    // Trigger a resize to fill the container-element:
    window.setTimeout(() => window.dispatchEvent(new UIEvent('resize')), 200);
  }

  private createLayer(layer: IbfLayer): IbfLayer {
    if (layer.type === IbfLayerType.point) {
      layer.leafletLayer = this.createPointLayer(layer);
    }

    if (layer.type === IbfLayerType.shape) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);

      const colors = this.mapService.state.colorGradient;
      const colorThreshold = this.mapService.getColorThreshold(
        layer.data,
        layer.colorProperty,
      );

      if (layer.name !== IbfLayerName.adminRegions) {
        this.addLegend(this.map, colors, colorThreshold, layer);
      }
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
          case IbfLayerName.redcrossBranches:
            return this.createMarkerRedcrossBranch(
              geoJsonPoint.properties as RedcrossBranch,
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
      pane:
        layer.group && layer.group === IbfLayerGroup.aggregates
          ? 'ibf-aggregate'
          : 'overlayPane',
      style: this.mapService.setAdminRegionStyle(layer),
      onEachFeature: function (feature, element) {
        element.on('click', function () {
          if (
            layer.colorProperty === IndicatorName.PopulationAffected &&
            feature.properties[layer.colorProperty] > 0
          ) {
            const popup =
              '<strong>' +
              feature.properties.name +
              '</strong><br/>' +
              'Population exposed: ' +
              Math.round(feature.properties[IndicatorName.PopulationAffected]) +
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
      pane: 'ibf-wms',
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
      icon: icon(this.iconGlofasDefault),
    });
  }

  private createMarkerStation(
    markerProperties: Station,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.station_name;
    let markerIcon = this.iconGlofasDefault;

    if (markerProperties.fc_trigger === '1') {
      markerIcon = this.iconGlofasWarning;
    }

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: markerIcon ? icon(markerIcon) : divIcon(),
      zIndexOffset: 700,
    });
    markerInstance.bindPopup(this.createMarkerStationPopup(markerProperties));

    return markerInstance;
  }

  private createMarkerRedcrossBranch(
    markerProperties: RedcrossBranch,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;
    let markerIcon = this.iconRedcrossBranch;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: markerIcon ? icon(markerIcon) : divIcon(),
    });
    markerInstance.bindPopup(this.createMarkerRedcrossPopup(markerProperties));

    return markerInstance;
  }

  private createMarkerStationPopup(markerProperties: Station) {
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

  private createMarkerRedcrossPopup(markerProperties: RedcrossBranch) {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Branch: ' +
      markerProperties.name +
      '</strong>' +
      '</div>'
    ).concat(
      markerProperties.nr_volunteers
        ? '<div style="margin-bottom: 5px">' +
            'Nr. of volunteers: ' +
            markerProperties.nr_volunteers +
            '</div>'
        : '',

      markerProperties.contact_person
        ? '<div style="margin-bottom: 5px">' +
            'Contact person: ' +
            markerProperties.contact_person +
            '</div>'
        : '',

      markerProperties.contact_address
        ? '<div style="margin-bottom: 5px">' +
            'Contact address: ' +
            markerProperties.contact_address +
            '</div>'
        : '',

      markerProperties.contact_number
        ? '<div style="margin-bottom: 5px">' +
            'Contact number: ' +
            markerProperties.contact_number +
            '</div>'
        : '',
    );
    return branchInfoPopup;
  }
}
