import { Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import {
  Control,
  divIcon,
  DomUtil,
  geoJSON,
  GeoJSON,
  icon,
  IconOptions,
  LatLng,
  Layer,
  Map,
  MapOptions,
  marker,
  Marker,
  markerClusterGroup,
  MarkerClusterGroup,
  point,
  tileLayer,
} from 'leaflet';
import { Subscription } from 'rxjs';
import {
  AnalyticsEvent,
  AnalyticsPage,
} from 'src/app/analytics/analytics.enum';
import { AnalyticsService } from 'src/app/analytics/analytics.service';
import {
  LEAFLET_MAP_ATTRIBUTION,
  LEAFLET_MAP_OPTIONS,
  LEAFLET_MAP_URL_TEMPLATE,
  LEAFLET_MARKER_ICON_OPTIONS_BASE,
  LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH,
  LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT,
} from 'src/app/config';
import { Country, EapAlertClasses } from 'src/app/models/country.model';
import {
  HealthSite,
  RedCrossBranch,
  Station,
  Waterpoint,
} from 'src/app/models/poi.model';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import {
  IbfLayer,
  IbfLayerGroup,
  IbfLayerName,
  IbfLayerType,
  IbfLayerWMS,
} from 'src/app/types/ibf-layer';
import { NumberFormat } from 'src/app/types/indicator-group';
import { LeadTime } from 'src/app/types/lead-time';
import { breakKey } from '../../models/map.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnDestroy {
  private map: Map;
  public layers: IbfLayer[] = [];
  private placeCode: string;
  private country: Country;

  public legends: { [key: string]: Control } = {};

  private layerSubscription: Subscription;
  private countrySubscription: Subscription;
  private placeCodeSubscription: Subscription;

  private osmTileLayer = tileLayer(LEAFLET_MAP_URL_TEMPLATE, {
    attribution: LEAFLET_MAP_ATTRIBUTION,
  });

  public leafletOptions: MapOptions = {
    ...LEAFLET_MAP_OPTIONS,
    layers: [this.osmTileLayer],
  };

  public leafletLayersControl: LeafletControlLayersConfig = {
    baseLayers: {},
    overlays: {},
  };

  constructor(
    private countryService: CountryService,
    private timelineService: TimelineService,
    private mapService: MapService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private analyticsService: AnalyticsService,
  ) {
    this.layerSubscription = this.mapService
      .getLayerSubscription()
      .subscribe(this.onLayerChange);

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
  }

  private filterLayerByLayerName = (newLayer) => (layer) =>
    layer.name === newLayer.name;

  private onLayerChange = (newLayer) => {
    if (newLayer) {
      const newLayerIndex = this.layers.findIndex(
        this.filterLayerByLayerName(newLayer),
      );
      newLayer =
        newLayer.data || newLayer.type === IbfLayerType.wms
          ? this.createLayer(newLayer)
          : newLayer;
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

    this.triggerWindowResize();
  };

  private onCountryChange = (country: Country) => {
    this.country = country;
  };

  private onPlaceCodeChange = (): void => {
    this.layers.forEach((layer: IbfLayer): void => {
      if (layer.leafletLayer && 'resetStyle' in layer.leafletLayer) {
        layer.leafletLayer.resetStyle();
      }
    });
  };

  private triggerWindowResize = () => {
    // Trigger a resize to fill the container-element:
    window.setTimeout(() => window.dispatchEvent(new UIEvent('resize')), 200);
  };

  private numberFormat(d, layer) {
    if (layer.numberFormatMap === NumberFormat.perc) {
      return Math.round(d * 100) + '%';
    } else if (layer.numberFormatMap === NumberFormat.decimal2) {
      return Math.round(d * 100) / 100;
    } else if (layer.numberFormatMap === NumberFormat.decimal0) {
      return Math.round(d);
    } else {
      return Math.round(d);
    }
  }

  private getFeatureColorByColorsAndColorThresholds = (
    colors,
    colorThreshold,
  ) => (feature) => {
    return feature > colorThreshold[breakKey.break4]
      ? colors[4]
      : feature > colorThreshold[breakKey.break3]
      ? colors[3]
      : feature > colorThreshold[breakKey.break2]
      ? colors[2]
      : feature > colorThreshold[breakKey.break1]
      ? colors[1]
      : colors[0];
  };

  public addLegend(map, colors, colorThreshold, layer: IbfLayer) {
    if (this.legends[layer.name]) {
      map.removeControl(this.legends[layer.name]);
    }

    if (layer.active) {
      this.legends[layer.name] = new Control();
      this.legends[layer.name].setPosition('bottomleft');
      this.legends[layer.name].onAdd = () => {
        const div = DomUtil.create('div', 'info legend');
        const grades = [
          0,
          colorThreshold[breakKey.break1],
          colorThreshold[breakKey.break2],
          colorThreshold[breakKey.break3],
          colorThreshold[breakKey.break4],
        ];

        let labels;
        if (layer.colorBreaks) {
          labels = [
            layer.colorBreaks['1'].label,
            layer.colorBreaks['2'].label,
            layer.colorBreaks['3'].label,
            layer.colorBreaks['4'].label,
            layer.colorBreaks['5'].label,
          ];
        }
        const getColor = this.getFeatureColorByColorsAndColorThresholds(
          colors,
          colorThreshold,
        );

        div.innerHTML +=
          `<div><b>${layer.label}</b>` +
          (layer.unit ? ' (' + layer.unit + ')' : '') +
          `</div>`;

        for (let i = 0; i < grades.length; i++) {
          if (i === 0 || grades[i] > grades[i - 1]) {
            div.innerHTML +=
              '<i style="background:' +
              getColor(grades[i] + 0.0001) +
              '"></i> ' +
              this.numberFormat(grades[i], layer) +
              (typeof grades[i + 1] !== 'undefined'
                ? '&ndash;' +
                  this.numberFormat(grades[i + 1], layer) +
                  (labels ? '  -  ' + labels[i] : '') +
                  '<br/>'
                : '+' + (labels ? '  -  ' + labels[i] : ''));
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

    this.triggerWindowResize();
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
        layer.colorBreaks,
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

  private getPointToLayerByLayer = (layerName) => (
    geoJsonPoint: GeoJSON.Feature,
    latlng: LatLng,
  ): Marker => {
    switch (layerName) {
      case IbfLayerName.glofasStations:
        return this.createMarkerStation(
          geoJsonPoint.properties as Station,
          latlng,
        );
      case IbfLayerName.redCrossBranches:
        return this.createMarkerRedCrossBranch(
          geoJsonPoint.properties as RedCrossBranch,
          latlng,
        );
      case IbfLayerName.waterpoints:
        return this.createMarkerWaterpoint(
          geoJsonPoint.properties as Waterpoint,
          latlng,
        );
      case IbfLayerName.healthSites:
        return this.createMarkerHealthSite(
          geoJsonPoint.properties as HealthSite,
          latlng,
        );
      default:
        return this.createMarkerDefault(latlng);
    }
  };

  private getIconCreateFunction = (cluster) => {
    const clusterSize = cluster.getChildCount();
    let size: number;
    let className: string;
    switch (true) {
      case clusterSize <= 10:
        size = 30;
        className = 'waterpoint-cluster-10';
        break;
      case clusterSize < 100:
        size = 40;
        className = 'waterpoint-cluster-100';
        break;
      case clusterSize < 1000:
        size = 60;
        className = 'waterpoint-cluster-1000';
        break;
      default:
        size = 80;
        className = 'waterpoint-cluster-10000';
        break;
    }
    return divIcon({
      html: '<b>' + String(clusterSize) + '</b>',
      className,
      iconSize: point(size, size),
    });
  };

  private createPointLayer(layer: IbfLayer): GeoJSON | MarkerClusterGroup {
    if (!layer.data) {
      return;
    }
    const mapLayer = geoJSON(layer.data, {
      pointToLayer: this.getPointToLayerByLayer(layer.name),
    });
    if (layer.name === IbfLayerName.waterpoints) {
      const waterPointClusterLayer = markerClusterGroup({
        iconCreateFunction: this.getIconCreateFunction,
        maxClusterRadius: 50,
      });
      waterPointClusterLayer.addLayer(mapLayer);
      return waterPointClusterLayer;
    }
    return mapLayer;
  }

  private onAdminRegionMouseOver = (event): void => {
    event.target.setStyle({
      fillOpacity: this.mapService.hoverFillOpacity,
      fillColor: this.eventService.state.activeTrigger
        ? this.mapService.alertColor
        : this.mapService.safeColor,
    });
  };

  private onAdminRegionClickByLayerAndFeatureAndElement = (
    layer,
    feature,
    element,
  ) => (): void => {
    this.analyticsService.logEvent(AnalyticsEvent.mapPlaceSelect, {
      placeCode: feature.properties.pcode,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    this.placeCodeService.setPlaceCode({
      countryCodeISO3: feature.properties.country_code,
      placeCodeName: feature.properties.name,
      placeCode: feature.properties.pcode,
    });

    if (layer.name !== IbfLayerName.adminRegions) {
      const popup =
        '<strong>' +
        feature.properties.name +
        (feature.properties.pcode.includes('Disputed')
          ? ' (Disputed borders)'
          : '') +
        '</strong><br/>' +
        layer.label +
        ': ' +
        this.numberFormat(
          typeof feature.properties[layer.colorProperty] !== 'undefined'
            ? feature.properties[layer.colorProperty]
            : feature.properties.indicators[layer.colorProperty],
          layer,
        ) +
        (layer.unit ? ' ' + layer.unit : '');
      if (feature.properties.pcode === this.placeCode) {
        element.unbindPopup();
        this.placeCode = null;
      } else {
        element.bindPopup(popup).openPopup();
        this.placeCode = feature.properties.pcode;
      }
    }
  };

  private createAdminRegionsLayer(layer: IbfLayer): GeoJSON {
    if (!layer.data) {
      return;
    }

    const adminRegionsLayer = geoJSON(layer.data, {
      pane:
        layer.group && layer.group === IbfLayerGroup.aggregates
          ? 'ibf-aggregate'
          : 'overlayPane',
      style: this.mapService.setAdminRegionStyle(layer),
      onEachFeature: (feature, element): void => {
        element.on('mouseover', this.onAdminRegionMouseOver);
        element.on('mouseout', (): void => {
          adminRegionsLayer.resetStyle();
        });
        element.on(
          'click',
          this.onAdminRegionClickByLayerAndFeatureAndElement(
            layer,
            feature,
            element,
          ),
        );
      },
    });

    return adminRegionsLayer;
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

  private onMapMarkerClick = (analyticsEvent) => (): void => {
    this.analyticsService.logEvent(analyticsEvent, {
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });
  };

  private createMarkerDefault(markerLatLng: LatLng): Marker {
    const markerInstance = marker(markerLatLng, {
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_BASE),
    });

    markerInstance.on('click', this.onMapMarkerClick(AnalyticsEvent.mapMarker));

    return markerInstance;
  }

  private createMarkerStation(
    markerProperties: Station,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.station_name;
    let markerIcon: IconOptions;
    let className: string;

    const eapAlertClasses = this.country
      ? this.country.eapAlertClasses
      : new EapAlertClasses();

    const glofasProbability = markerProperties.fc_prob;
    Object.keys(eapAlertClasses).forEach((key) => {
      if (
        glofasProbability >= eapAlertClasses[key].valueLow &&
        glofasProbability < eapAlertClasses[key].valueHigh
      ) {
        markerIcon = {
          ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
          iconSize: [25, 41],
          iconUrl: 'assets/markers/glofas-' + key + '.png',
          iconRetinaUrl: 'assets/markers/glofas-' + key + '.png',
        };
        className = 'station-popup-' + key;
      }
    });

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: markerIcon ? icon(markerIcon) : divIcon(),
      zIndexOffset: 700,
    });
    markerInstance.bindPopup(this.createMarkerStationPopup(markerProperties), {
      minWidth: 300,
      className,
    });
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.glofasStation),
    );

    return markerInstance;
  }

  private createMarkerRedCrossBranch(
    markerProperties: RedCrossBranch,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH),
    });
    markerInstance.bindPopup(this.createMarkerRedCrossPopup(markerProperties));
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.redCrossBranch),
    );

    return markerInstance;
  }

  private createMarkerHealthSite(
    markerProperties: HealthSite,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH),
    });
    markerInstance.bindPopup(this.createHealthSitePopup(markerProperties));
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.healthSite),
    );

    return markerInstance;
  }

  private createMarkerWaterpoint(
    markerProperties: Waterpoint,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.wpdxId;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT),
    });
    markerInstance.bindPopup(
      this.createMarkerWaterpointPopup(markerProperties),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.waterPoint),
    );

    return markerInstance;
  }

  private createMarkerStationPopup(markerProperties: Station): string {
    const eapAlertClasses = this.country
      ? this.country.eapAlertClasses
      : new EapAlertClasses();
    const glofasProbability = markerProperties.fc_prob;

    let eapStatusText: string;
    let eapStatuscolor: string;
    Object.keys(eapAlertClasses).forEach((key) => {
      if (
        glofasProbability >= eapAlertClasses[key].valueLow &&
        glofasProbability < eapAlertClasses[key].valueHigh
      ) {
        eapStatusText = eapAlertClasses[key].label;
        eapStatuscolor = eapAlertClasses[key].color;
      }
    });
    const headerColor =
      glofasProbability > eapAlertClasses.max.valueLow
        ? eapStatuscolor
        : 'var(--ion-color-ibf-royal-blue)';
    const headerTextColor =
      glofasProbability > eapAlertClasses.max.valueLow
        ? 'var(--ion-color-ibf-black)'
        : 'var(--ion-color-ibf-white)';

    const triggerWidth = Math.max(
      Math.min(
        Math.round(
          (markerProperties.fc / markerProperties.trigger_level) * 100,
        ),
        115,
      ),
      0,
    );

    let lastAvailableLeadTime: LeadTime;

    if (this.country) {
      lastAvailableLeadTime = this.country.countryActiveLeadTimes[
        this.country.countryActiveLeadTimes.length - 1
      ];
    }

    const leadTime =
      this.timelineService.activeLeadTime || lastAvailableLeadTime;

    const stationInfoPopup =
      '<div style="background-color: ' +
      headerColor +
      '; color: ' +
      headerTextColor +
      '; padding: 5px; margin-bottom: 5px"> \
        <strong>' +
      markerProperties.station_code +
      ' STATION: ' +
      markerProperties.station_name +
      '</strong> \
      </div> \
      <div style="margin-left:5px"> \
        <div style="margin-bottom:5px">' +
      leadTime +
      ' forecast river discharge (in m<sup>3</sup>/s) \
      </div> \
      <div style="border-radius:10px;height:20px;background-color:grey; width: 100%"> \
        <div style="border-radius:10px 0 0 10px;height:20px;background-color:#d4d3d2; width: 80%"> \
          <div style="border-radius:10px;height:20px;line-height:20px;background-color:var(--ion-color-ibf-royal-blue); color:white; text-align:center; white-space: nowrap; min-width: 15%; width:' +
      triggerWidth +
      '%">' +
      Math.round(markerProperties.fc) +
      '</div></div></div> \
    <div style="height:20px;background-color:none; border-right: dashed; border-right-width: thin; float: left; width: 80%; padding-top: 5px; margin-bottom:10px"> \
      Trigger activation threshold:</div> \
   \
  <div style="height:20px;background-color:none; margin-left: 81%; text-align: left; width: 20%; padding-top: 5px; margin-bottom:10px"><strong>' +
      Math.round(markerProperties.trigger_level) +
      '</strong></div></div> \
</div> \
  <div style="background-color: ' +
      eapStatuscolor +
      '; color: var(--ion-color-ibf-black); padding: 10px; text-align: center; text-transform:uppercase"> \
    <strong>' +
      eapStatusText +
      '</strong> \
  </div>';

    return stationInfoPopup;
  }

  private createMarkerRedCrossPopup(markerProperties: RedCrossBranch): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Branch: ' +
      markerProperties.name +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Nr. of volunteers: ' +
        (markerProperties.numberOfVolunteers || '') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Contact person: ' +
        (markerProperties.contactPerson || '') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Contact address: ' +
        (markerProperties.contactAddress || '') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Contact number: ' +
        (markerProperties.contactNumber || '') +
        '</div>',
    );
    return branchInfoPopup;
  }

  private createHealthSitePopup(markerProperties: HealthSite): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Name: ' +
      markerProperties.name +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Type: ' +
        (markerProperties.type || '') +
        '</div>',
    );
    return branchInfoPopup;
  }

  private createMarkerWaterpointPopup(markerProperties: Waterpoint): string {
    const waterpointInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>ID: ' +
      markerProperties.wpdxId +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Waterpoint type: ' +
        (markerProperties.type ? markerProperties.type : 'unknown') +
        '</div>',
      '<div style="margin-bottom: 5px">' +
        'Report date: ' +
        markerProperties.reportDate +
        '</div>',
    );
    return waterpointInfoPopup;
  }
}
