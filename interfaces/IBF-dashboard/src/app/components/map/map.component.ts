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
import { DateTime } from 'luxon';
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
  LEAFLET_MARKER_ICON_OPTIONS_DAM,
  LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT,
  LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT_HOSPITAL,
  LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH,
  LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT,
} from 'src/app/config';
import {
  Country,
  DisasterType,
  EapAlertClasses,
} from 'src/app/models/country.model';
import {
  DamSite,
  HealthSite,
  HealthSiteType,
  RedCrossBranch,
  Station,
  TyphoonTrackPoint,
  VulnerableGroups,
  Waterpoint,
} from 'src/app/models/poi.model';
import { ApiService } from 'src/app/services/api.service';
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
  LeafletPane,
} from 'src/app/types/ibf-layer';
import { NumberFormat } from 'src/app/types/indicator-group';
import { LeadTime } from 'src/app/types/lead-time';
import { breakKey } from '../../models/map.model';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { IbfLayerThreshold } from './../../types/ibf-layer';

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
  private disasterType: DisasterType;
  public lastModelRunDate: string;

  public legends: { [key: string]: Control } = {};

  private layerSubscription: Subscription;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
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
    private disasterTypeService: DisasterTypeService,
    private timelineService: TimelineService,
    private mapService: MapService,
    private placeCodeService: PlaceCodeService,
    private eventService: EventService,
    private analyticsService: AnalyticsService,
    private apiService: ApiService,
  ) {
    this.layerSubscription = this.mapService
      .getLayerSubscription()
      .subscribe(this.onLayerChange);

    this.countrySubscription = this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);

    this.disasterTypeSubscription = this.disasterTypeService
      .getDisasterTypeSubscription()
      .subscribe(this.onDisasterTypeChange);

    this.placeCodeSubscription = this.placeCodeService
      .getPlaceCodeSubscription()
      .subscribe(this.onPlaceCodeChange);
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
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

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    this.disasterType = disasterType;

    if (this.country) {
      this.apiService
        .getRecentDates(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
        )
        .subscribe((date) => {
          this.onRecentDates(date);
        });
    }
  };

  private onRecentDates = (date) => {
    this.lastModelRunDate = date.timestamp || date.date;
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
    if (d === null) {
      return null;
    } else if (layer.numberFormatMap === NumberFormat.perc) {
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
          colorThreshold[breakKey.break0],
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
          (layer.unit ? ' (' + layer.unit + ')' : '');

        const noDataEntryFound = layer.data.features.find(
          (f) => f.properties.indicators[layer.name] === null,
        );
        if (noDataEntryFound) {
          div.innerHTML +=
            `</div><i style="background:` +
            this.mapService.state.noDataColor +
            `"></i> No data<br>`;
        }

        for (let i = 0; i < grades.length; i++) {
          if (grades[i] !== null && (i === 0 || grades[i] > grades[i - 1])) {
            div.innerHTML +=
              '<i style="background:' +
              getColor(grades[i]) +
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
    this.map.createPane(LeafletPane.wmsPane);
    this.map.createPane(LeafletPane.adminBoundaryPane);
    this.map.createPane(LeafletPane.outline);
    this.map.getPane(LeafletPane.outline).style.zIndex = '570';
    this.map.createPane(LeafletPane.aggregatePane);
    this.triggerWindowResize();
  }

  private createLayer(layer: IbfLayer): IbfLayer {
    if (layer.type === IbfLayerType.point) {
      layer.leafletLayer = this.createPointLayer(layer);
    }

    if (layer.type === IbfLayerType.shape) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);

      const colors = this.eventService.state.activeTrigger
        ? this.mapService.state.colorGradientTriggered
        : this.mapService.state.colorGradient;
      const colorThreshold = this.mapService.getColorThreshold(
        layer.data,
        layer.colorProperty,
        layer.colorBreaks,
      );

      if (
        layer.group !== IbfLayerGroup.adminRegions &&
        layer.group !== IbfLayerGroup.outline
      ) {
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
      case IbfLayerName.typhoonTrack:
        return this.createMarkerTyphoonTrack(
          geoJsonPoint.properties as TyphoonTrackPoint,
          latlng,
        );
      case IbfLayerName.vulnerableGroups:
        return this.createMarkerVulnerableGroups(
          geoJsonPoint.properties as VulnerableGroups,
          latlng,
        );
      case IbfLayerName.damSites:
        return this.createMarkerDam(geoJsonPoint.properties as DamSite, latlng);
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

    if (layer.name === IbfLayerName.healthSites) {
      const healthSiteClusterLayer = markerClusterGroup({
        iconCreateFunction: this.getIconCreateFunction,
        maxClusterRadius: 10,
      });
      healthSiteClusterLayer.addLayer(mapLayer);
      return healthSiteClusterLayer;
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
    feature,
    element,
  ) => (): void => {
    this.analyticsService.logEvent(AnalyticsEvent.mapPlaceSelect, {
      placeCode: feature.properties.placeCode,
      page: AnalyticsPage.dashboard,
      isActiveEvent: this.eventService.state.activeEvent,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    if (feature.properties.placeCode === this.placeCode) {
      element.unbindPopup();
      this.placeCode = null;
      this.placeCodeService.clearPlaceCode();
    } else {
      this.bindPopupAdminRegions(feature, element);
      this.placeCode = feature.properties.placeCode;
      this.placeCodeService.setPlaceCode({
        countryCodeISO3: feature.properties.countryCodeISO3,
        placeCodeName: feature.properties.name,
        placeCode: feature.properties.placeCode,
      });
    }
  };

  private bindPopupAdminRegions(feature, element): void {
    let popup: string;
    const activeAggregateLayer = this.mapService.layers.find(
      (l) => l.active && l.group === IbfLayerGroup.aggregates,
    );
    if (
      activeAggregateLayer &&
      activeAggregateLayer.name === IbfLayerName.potentialCases
    ) {
      this.apiService
        .getAdminAreaDynamicDataOne(
          IbfLayerThreshold.potentialCasesThreshold,
          feature.properties.placeCode,
          this.timelineService.activeLeadTime,
        )
        .subscribe((thresholdValue: number) => {
          popup = this.createThresHoldPopupAdminRegions(
            activeAggregateLayer,
            feature,
            thresholdValue,
          );
          const popupOptions = {
            minWidth: 300,
            className: 'trigger-popup-max',
          };
          element.bindPopup(popup, popupOptions).openPopup();
        });
    } else {
      popup = this.createDefaultPopupAdminRegions(
        activeAggregateLayer,
        feature,
      );
      element.bindPopup(popup).openPopup();
    }
  }

  private getAdminRegionLayerPane(layer: IbfLayer): LeafletPane {
    let adminRegionLayerPane = LeafletPane.overlayPane;
    switch (layer.group) {
      case IbfLayerGroup.aggregates:
        adminRegionLayerPane = LeafletPane.aggregatePane;
        break;
      case IbfLayerGroup.adminRegions:
        adminRegionLayerPane = LeafletPane.adminBoundaryPane;
        break;
      default:
        adminRegionLayerPane = LeafletPane.overlayPane;
        break;
    }
    return adminRegionLayerPane;
  }

  private createDefaultPopupAdminRegions(
    activeAggregateLayer: IbfLayer,
    feature,
  ): string {
    feature = activeAggregateLayer.data.features.find(
      (f) => f.properties.placeCode === feature.properties.placeCode,
    );
    return (
      '<strong>' +
      feature.properties.name +
      (feature.properties.placeCode.includes('Disputed')
        ? ' (Disputed borders)'
        : '') +
      '</strong><br/>' +
      (!activeAggregateLayer
        ? ''
        : activeAggregateLayer.label +
          ': ' +
          this.numberFormat(
            typeof feature.properties[activeAggregateLayer.colorProperty] !==
              'undefined'
              ? feature.properties[activeAggregateLayer.colorProperty]
              : feature.properties.indicators[
                  activeAggregateLayer.colorProperty
                ],
            activeAggregateLayer,
          ))
    );
  }

  private createThresHoldPopupAdminRegions(
    layer: IbfLayer,
    feature,
    thresholdValue: number,
  ): string {
    const properties = 'properties';
    const forecastValue = feature[properties][layer.colorProperty];
    const featureTriggered = forecastValue > thresholdValue;
    const headerTextColor = featureTriggered
      ? 'var(--ion-color-ibf-trigger-alert-primary-contrast)'
      : 'var(--ion-color-ibf-no-alert-primary-contrast)';
    const title = feature.properties.name;

    let lastAvailableLeadTime: LeadTime;
    if (this.country) {
      const leadTimes = this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).activeLeadTimes;
      lastAvailableLeadTime = leadTimes[leadTimes.length - 1];
    }

    const timeUnit = lastAvailableLeadTime.split('-')[1];

    const subtitle = `${layer.label} for current ${timeUnit} selected`;
    const eapStatusColor = featureTriggered
      ? 'var(--ion-color-ibf-trigger-alert-primary)'
      : 'var(--ion-color-ibf-no-alert-primary)';
    const eapStatusText = featureTriggered
      ? 'ACTIVATE EARLY ACTIONS'
      : 'No action';
    const thresholdName = 'Alert threshold';

    return this.createThresholdPopup(
      headerTextColor,
      title,
      eapStatusColor,
      eapStatusText,
      forecastValue,
      thresholdValue,
      subtitle,
      thresholdName,
    );
  }

  private createThresholdPopup(
    eapStatusColorText: string,
    title: string,
    eapStatusColor: string,
    eapStatusText: string,
    forecastValue: number,
    thresholdValue: number,
    subtitle: string,
    thresholdName: string,
  ): string {
    const triggerWidth = Math.max(
      Math.min(Math.round((forecastValue / thresholdValue) * 100), 115),
      0,
    );
    const infoPopup = `
      <div style="background-color:${eapStatusColor}; color:${eapStatusColorText}; padding: 5px; margin-bottom: 5px"> \ \
        <strong>${title}
      </strong> \
      </div> \
      <div style="margin-left:5px"> \
        <div style="margin-bottom:5px"> \
      ${subtitle} \
      </div> \
      <div style="border-radius:10px;height:20px;background-color:grey; width: 100%"> \
        <div style="border-radius:10px 0 0 10px;height:20px;background-color:#d4d3d2; width: 80%"> \
          <div style="border-radius:10px;height:20px;line-height:20px;background-color:${eapStatusColor}; color:${eapStatusColorText}; text-align:center; white-space: nowrap; min-width: 15%; width:${triggerWidth}%">${Math.round(
      forecastValue,
    )}</div> \
        </div> \
      </div> \
    <div style="height:20px;background-color:none; border-right: dashed; border-right-width: thin; float: left; width: 80%; padding-top: 5px; margin-bottom:10px"> \
      ${thresholdName}:</div> \
   \
  <div style="height:20px;background-color:none; margin-left: 81%; text-align: left; width: 20%; padding-top: 5px; margin-bottom:10px"><strong>${Math.round(
    thresholdValue,
  )}</strong></div></div> \
</div> \
  <div style="background-color: ${eapStatusColor}; color:${eapStatusColorText}; padding: 10px; text-align: center; text-transform:uppercase"> \
    <strong>${eapStatusText}</strong> \
  </div>`;

    return infoPopup;
  }

  private createAdminRegionsLayer(layer: IbfLayer): GeoJSON {
    if (!layer.data) {
      return;
    }
    let adminRegionsLayer: GeoJSON;
    if (layer.group === IbfLayerGroup.outline) {
      adminRegionsLayer = geoJSON(layer.data, {
        pane: LeafletPane.outline,
        style: this.mapService.setOutlineLayerStyle(layer),
        interactive: false,
      });
    } else {
      adminRegionsLayer = geoJSON(layer.data, {
        pane: this.getAdminRegionLayerPane(layer),
        style: this.mapService.setAdminRegionStyle(layer),
        onEachFeature: (feature, element): void => {
          element.on('mouseover', this.onAdminRegionMouseOver);
          element.on('mouseout', (): void => {
            adminRegionsLayer.resetStyle();
          });
          element.on(
            'click',
            this.onAdminRegionClickByLayerAndFeatureAndElement(
              feature,
              element,
            ),
          );
        },
      });
    }
    return adminRegionsLayer;
  }

  private createWmsLayer(layerWMS: IbfLayerWMS): Layer {
    if (!layerWMS) {
      return;
    }
    return tileLayer.wms(layerWMS.url, {
      pane: LeafletPane.wmsPane,
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
    const markerTitle = markerProperties.stationName;
    let markerIcon: IconOptions;
    let className: string;

    const eapAlertClasses =
      (this.country &&
        this.country.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        ).eapAlertClasses) ||
      ({} as EapAlertClasses);

    const glofasProbability = markerProperties.forecastProbability;
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
        className = 'trigger-popup-' + key;
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

  private createMarkerTyphoonTrack(
    markerProperties: TyphoonTrackPoint,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = DateTime.fromISO(
      markerProperties.timestampOfTrackpoint,
    ).toFormat('cccc, dd LLLL HH:mm');

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: divIcon({
        className:
          DateTime.fromISO(markerProperties.timestampOfTrackpoint) >
          DateTime.fromISO(this.lastModelRunDate)
            ? 'typhoon-track-icon-future'
            : 'typhoon-track-icon-past',
      }),
      zIndexOffset: 700,
    });
    markerInstance.bindPopup(this.createMarkerTyphoonTrackPopup(markerTitle));
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.typhoonTrack),
    );

    return markerInstance;
  }

  private createMarkerVulnerableGroups(
    markerProperties: VulnerableGroups,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = DateTime.fromISO(
      markerProperties.timestampOfVulnerableGroups,
    ).toFormat('cccc, dd LLLL HH:mm');

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: divIcon({
        className:
          DateTime.fromISO(markerProperties.timestampOfVulnerableGroups) >
          DateTime.fromISO(this.lastModelRunDate)
            ? 'typhoon-track-icon-future'
            : 'typhoon-track-icon-past',
      }),
      zIndexOffset: 700,
    });
    markerInstance.bindPopup(this.createMarkerVulnerableGroupsPopup(markerTitle));
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.vulnerableGroups),
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

  private createMarkerDam(
    markerProperties: DamSite,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.damName;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_DAM),
    });
    markerInstance.bindPopup(this.createMarkerDamPopup(markerProperties));
    markerInstance.on('click', this.onMapMarkerClick(AnalyticsEvent.damSite));

    return markerInstance;
  }

  private createMarkerHealthSite(
    markerProperties: HealthSite,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.name;

    let markerInstance;

    if (markerProperties.type === HealthSiteType.hospital) {
      markerInstance = marker(markerLatLng, {
        title: markerTitle,
        icon: icon(LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT_HOSPITAL),
      });
    } else if (markerProperties.type === HealthSiteType.clinic) {
      markerInstance = marker(markerLatLng, {
        title: markerTitle,
        icon: icon(LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT),
      });
    }
    if (markerInstance) {
      markerInstance.bindPopup(this.createHealthSitePopup(markerProperties));
      markerInstance.on(
        'click',
        this.onMapMarkerClick(AnalyticsEvent.healthSite),
      );
    }

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
    const eapAlertClasses =
      (this.country &&
        this.country.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        ).eapAlertClasses) ||
      ({} as EapAlertClasses);
    const glofasProbability = markerProperties.forecastProbability;

    let eapStatusText: string;
    let eapStatusColor: string;
    let eapStatusColorText: string;
    Object.keys(eapAlertClasses).forEach((key) => {
      if (
        glofasProbability >= eapAlertClasses[key].valueLow &&
        glofasProbability < eapAlertClasses[key].valueHigh
      ) {
        eapStatusText = eapAlertClasses[key].label;
        eapStatusColor = `var(--ion-color-${eapAlertClasses[key].color})`;
        eapStatusColorText = `var(--ion-color-${eapAlertClasses[key].color}-contrast)`;
      }
    });

    const title =
      markerProperties.stationCode +
      ' STATION: ' +
      markerProperties.stationName;

    let lastAvailableLeadTime: LeadTime;
    if (this.country) {
      const leadTimes = this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      ).activeLeadTimes;
      lastAvailableLeadTime = leadTimes[leadTimes.length - 1];
    }

    const leadTime =
      this.timelineService.activeLeadTime || lastAvailableLeadTime;
    const subtitle = `${leadTime} forecast river discharge (in m<sup>3</sup>/s) \
          ${
            markerProperties.forecastReturnPeriod
              ? `<br>This corresponds to a return period of <strong>${markerProperties.forecastReturnPeriod}</strong> years`
              : ''
          }`;

    const thresholdName = 'Trigger activation threshold';
    const stationInfoPopup = this.createThresholdPopup(
      eapStatusColorText,
      title,
      eapStatusColor,
      eapStatusText,
      markerProperties.forecastLevel,
      markerProperties.triggerLevel,
      subtitle,
      thresholdName,
    );
    return stationInfoPopup;
  }

  private createMarkerTyphoonTrackPopup(markerTitle: string): string {
    const trackpointInfoPopup =
      '<div style="margin-bottom: 5px">' +
      '<strong>Typhoon passes here at</strong>:<br>' +
      markerTitle +
      '</div>';
    return trackpointInfoPopup;
  }

  private createMarkerVulnerableGroupsPopup(markerTitle: string): string {
    const vulnerableGroupsInfoPopup =
      '<div style="margin-bottom: 5px">' +
      '<strong>Typhoon passes here at</strong>:<br>' +
      markerTitle +
      '</div>';
    return vulnerableGroupsInfoPopup;
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

  private createMarkerDamPopup(markerProperties: DamSite): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Branch: ' +
      markerProperties.damName +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Full Supply Capacity: ' +
        (Math.round(markerProperties.fullSupply).toLocaleString() || '') +
        ' million m<sup>3</sup></div>',
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
