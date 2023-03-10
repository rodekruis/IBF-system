import { Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import { TranslateService } from '@ngx-translate/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import {
  Control,
  divIcon,
  DomUtil,
  geoJSON,
  GeoJSON,
  icon,
  IconOptions,
  LatLng,
  LatLngBoundsLiteral,
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
  LEAFLET_MARKER_ICON_OPTIONS_EVACUATION_CENTER,
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
  EvacuationCenter,
  HealthSite,
  HealthSiteType,
  RedCrossBranch,
  Station,
  TyphoonTrackPoint,
  Waterpoint,
} from 'src/app/models/poi.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { EventState } from 'src/app/types/event-state';
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
import { PlaceCode } from '../../models/place-code.model';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { TimelineState } from '../../types/timeline-state';
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
  public eventState: EventState;
  public timelineState: TimelineState;

  public legends: { [key: string]: Control } = {};

  private layerSubscription: Subscription;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;

  private closestPointToTyphoon: number;
  private TYPHOON_TRACK_NORMAL_POINT_SIZE = 15;
  private TYPHOON_TRACK_LATEST_POINT_SIZE = 26;

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
    private translate: TranslateService,
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

    this.initialEventStateSubscription = this.eventService
      .getInitialEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.manualEventStateSubscription = this.eventService
      .getManualEventStateSubscription()
      .subscribe(this.onEventStateChange);

    this.timelineStateSubscription = this.timelineService
      .getTimelineStateSubscription()
      .subscribe(this.onTimelineStateChange);
  }

  ngOnDestroy() {
    this.layerSubscription.unsubscribe();
    this.countrySubscription.unsubscribe();
    this.placeCodeSubscription.unsubscribe();
    this.disasterTypeSubscription.unsubscribe();
    this.initialEventStateSubscription.unsubscribe();
    this.manualEventStateSubscription.unsubscribe();
    this.timelineStateSubscription.unsubscribe();
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
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;

    this.lastModelRunDate = this.timelineState?.today.toUTC().toString();
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode): void => {
    this.placeCode = placeCode?.placeCode;

    this.layers.forEach((layer: IbfLayer): void => {
      if (layer.leafletLayer && 'resetStyle' in layer.leafletLayer) {
        layer.leafletLayer.resetStyle();
      }
    });

    this.zoomToArea();

    // Close all open popups when (going back to) all admin-areas
    if (!this.placeCode && this.map) {
      this.map.eachLayer((layer) => {
        layer.closePopup();
      });
    }
  };

  private zoomToArea() {
    if (this.mapService.adminLevel) {
      const adminRegionsLayer = this.layers.find(
        (layer) =>
          layer.name ===
          `${IbfLayerGroup.adminRegions}${this.mapService.adminLevel}`,
      );
      if (adminRegionsLayer) {
        const adminRegionsFiltered = JSON.parse(
          JSON.stringify(adminRegionsLayer.data),
        );
        let zoomExtraOffset: number;
        if (this.placeCode) {
          adminRegionsFiltered.features = adminRegionsLayer.data?.features.filter(
            (area) => area?.properties?.placeCode === this.placeCode,
          );
          zoomExtraOffset = 0.5;
        } else {
          adminRegionsFiltered.features = adminRegionsLayer.data?.features;
          zoomExtraOffset = 0;
        }
        const layerBounds = bbox(adminRegionsFiltered);
        this.mapService.state.bounds = containsNumber(layerBounds)
          ? ([
              [
                layerBounds[1] - zoomExtraOffset,
                layerBounds[0] - zoomExtraOffset,
              ],
              [
                layerBounds[3] + zoomExtraOffset,
                layerBounds[2] + zoomExtraOffset,
              ],
            ] as LatLngBoundsLiteral)
          : this.mapService.state.bounds;
        this.map.fitBounds(this.mapService.state.bounds);
      }
    }
  }

  private triggerWindowResize = () => {
    // Trigger a resize to fill the container-element:
    window.setTimeout(() => window.dispatchEvent(new UIEvent('resize')), 200);
  };

  private numberFormat(d, layer) {
    if (d === null) {
      return null;
    } else if (layer.numberFormatMap === NumberFormat.perc) {
      return Math.round(d * 100).toLocaleString() + '%';
    } else if (layer.numberFormatMap === NumberFormat.decimal2) {
      return (Math.round(d * 100) / 100).toLocaleString();
    } else if (layer.numberFormatMap === NumberFormat.decimal0) {
      return Math.round(d).toLocaleString();
    } else {
      return Math.round(d).toLocaleString();
    }
  }

  private getFeatureColorByColorsAndColorThresholds = (
    colors,
    colorThreshold,
  ) => (feature) => {
    return feature <= colorThreshold[breakKey.break1] ||
      !colorThreshold[breakKey.break1]
      ? colors[0]
      : feature <= colorThreshold[breakKey.break2] ||
        !colorThreshold[breakKey.break2]
      ? colors[1]
      : feature <= colorThreshold[breakKey.break3] ||
        !colorThreshold[breakKey.break3]
      ? colors[2]
      : feature <= colorThreshold[breakKey.break4] ||
        !colorThreshold[breakKey.break4]
      ? colors[3]
      : colors[4];
  };

  private getLabel = (grades, layer, labels) => (i) => {
    const label = labels ? '  -  ' + labels[i] : '';
    if (layer.colorBreaks) {
      const valueLow = layer.colorBreaks && layer.colorBreaks[i + 1]?.valueLow;
      const valueHigh =
        layer.colorBreaks && layer.colorBreaks[i + 1]?.valueHigh;
      if (valueLow === valueHigh) {
        return this.numberFormat(valueHigh, layer) + label + '<br/>';
      } else {
        return (
          this.numberFormat(valueLow, layer) +
          '&ndash;' +
          this.numberFormat(valueHigh, layer) +
          label +
          '<br/>'
        );
      }
    } else {
      const number1 = this.numberFormat(grades[i], layer);
      const number2 = this.numberFormat(grades[i + 1], layer);
      return (
        number1 +
        (typeof grades[i + 1] !== 'undefined' ? '&ndash;' + number2 : '+') +
        label +
        '<br/>'
      );
    }
  };

  public addLegend(colors, colorThreshold, layer: IbfLayer) {
    this.removeLegend();

    this.legends[layer.name] = new Control();
    this.legends[layer.name].setPosition('bottomleft');
    this.legends[layer.name].onAdd = () => {
      const div = DomUtil.create('div', 'info legend');
      const grades = Object.values(colorThreshold);
      let labels;
      if (layer.colorBreaks) {
        labels = Object.values(layer.colorBreaks).map(
          (colorBreak) => colorBreak.label,
        );
      }
      const getColor = this.getFeatureColorByColorsAndColorThresholds(
        colors,
        colorThreshold,
      );

      const getLabel = this.getLabel(grades, layer, labels);

      div.innerHTML +=
        `<div><b>${layer.label}</b>` +
        (layer.unit ? ' (' + layer.unit + ')' : '');

      const noDataEntryFound = layer.data?.features.find(
        (f) => f.properties?.indicators[layer.name] === null,
      );
      if (noDataEntryFound) {
        div.innerHTML += `</div><i style="background:${this.mapService.state.noDataColor}"></i> No data<br>`;
      }

      for (let i = 0; i < grades.length; i++) {
        if (grades[i] !== null && (i === 0 || grades[i] > grades[i - 1])) {
          div.innerHTML += `<i style="background:${getColor(
            grades[i + 1],
          )}"></i> ${getLabel(i)}`;
        }
      }

      return div;
    };
    this.legends[layer.name].addTo(this.map);
  }

  private removeLegend() {
    for (const legend of Object.keys(this.legends)) {
      this.map.removeControl(this.legends[legend]);
    }
    this.legends = {};
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

      const colors =
        this.eventState?.activeTrigger &&
        this.eventState?.event?.thresholdReached
          ? this.mapService.state.colorGradientTriggered
          : this.mapService.state.colorGradient;
      const colorThreshold = this.mapService.getColorThreshold(
        layer.data,
        layer.colorProperty,
        layer.colorBreaks,
      );

      if (
        this.layers.filter(
          (l) => l.group === IbfLayerGroup.aggregates && l.active,
        ).length === 0
      ) {
        this.removeLegend();
      }

      if (
        layer.group !== IbfLayerGroup.adminRegions &&
        layer.group !== IbfLayerGroup.outline &&
        layer.active
      ) {
        this.addLegend(colors, colorThreshold, layer);
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
      case IbfLayerName.evacuationCenters:
        return this.createMarkerEvacuationCenter(
          geoJsonPoint.properties as EvacuationCenter,
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

    if (layer.name === IbfLayerName.typhoonTrack) {
      this.calculateClosestPointToTyphoon(layer);
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

  private onAdminRegionMouseOver = (feature) => (event): void => {
    event.target.setStyle(
      this.mapService.setAdminRegionMouseOverStyle(
        feature.properties.placeCode,
      ),
    );
    this.placeCodeService.setPlaceCodeHover({
      countryCodeISO3: feature.properties.countryCodeISO3,
      placeCode: feature.properties.placeCode,
      placeCodeName: feature.properties.name,
      placeCodeParentName: feature.properties.nameParent,
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
        placeCode: feature.properties.placeCode,
        countryCodeISO3: feature.properties.countryCodeISO3,
        placeCodeName: feature.properties.name,
        placeCodeParentName: feature.properties.nameParent,
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
          this.timelineState.activeLeadTime,
          this.eventState?.event?.eventName,
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
    feature = activeAggregateLayer.data?.features.find(
      (f) => f.properties?.placeCode === feature.properties.placeCode,
    );
    return (
      '<strong>' +
      feature.properties.name +
      (feature.properties.placeCode.includes('Disputed')
        ? ' (Disputed borders)'
        : '') +
      '</strong>' +
      (feature.properties.nameParent
        ? ` (${feature.properties.nameParent})`
        : '') +
      '<br/>' +
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
          ) +
          ' ' +
          (activeAggregateLayer.unit || ''))
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
      )?.activeLeadTimes;
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
    const difference = forecastValue - thresholdValue;
    const closeMargin = 0.05;
    const tooClose = Math.abs(difference) / thresholdValue < closeMargin;

    const barValue =
      difference === 0 || !tooClose
        ? forecastValue
        : thresholdValue + Math.sign(difference) * thresholdValue * closeMargin;

    const triggerWidth = Math.max(
      Math.min(Math.round((barValue / thresholdValue) * 100), 115),
      0,
    );

    const addComma = (n) => Math.round(n).toLocaleString('en-US');

    const forecastBar = `
    <div style="border-radius:10px;height:20px;background-color:#d4d3d2; width: 100%">
        <div style="border-radius:10px 0 0 10px; border-right: dashed; border-right-width: thin;height:20px;width: 80%">
          <div style="
            border-radius:10px;
            height:20px;
            line-height:20px;
            background-color:${eapStatusColor};
            color:${eapStatusColorText};
            text-align:center;
            white-space: nowrap;
            min-width: 15%;
            width:${triggerWidth}%">${addComma(forecastValue)}</div>
        </div>
      </div>
    `;

    const infoPopup = `
      <div style="background-color:${eapStatusColor}; color:${eapStatusColorText}; padding: 5px; margin-bottom: 5px"> \ \
        <strong>${title}
      </strong> \
      </div> \
      <div style="margin-left:5px; margin-right: 5px"> \
        <div style="margin-bottom:5px"> \
      ${subtitle} \
      </div> \
      ${forecastBar}
    <div style="height:20px;background-color:none; border-right: dashed; border-right-width: thin; float: left; width: 80%; padding-top: 5px; margin-bottom:10px; text-align: right; padding-right: 2px;"> \
      ${thresholdName}:</div> \
   \
  <div style="height:20px;background-color:none; margin-left: 81%; text-align: left; width: 20%; padding-top: 5px; margin-bottom:10px"><strong>${addComma(
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
          element.on('mouseover', this.onAdminRegionMouseOver(feature));
          element.on('mouseout', (): void => {
            adminRegionsLayer.resetStyle();
            this.placeCodeService.clearPlaceCodeHover();
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

    markerIcon = {
      ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
      iconUrl: `assets/markers/glofas-station-${markerProperties.eapAlertClass}-trigger.svg`,
      iconRetinaUrl: `assets/markers/glofas-station-${markerProperties.eapAlertClass}-trigger.svg`,
    };
    className = `trigger-popup-${markerProperties.eapAlertClass}`;

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
    const markerDateTime = DateTime.fromISO(
      markerProperties.timestampOfTrackpoint,
    );
    const modelDateTime = DateTime.fromISO(this.lastModelRunDate);
    const isLatest = markerDateTime.equals(
      DateTime.fromMillis(this.closestPointToTyphoon),
    );

    let className = 'typhoon-track-icon';
    let passed = '';

    if (markerDateTime > modelDateTime) {
      className += ' typhoon-track-icon-future';
    } else {
      passed = '(Passed)';
      if (isLatest) {
        className += ' typhoon-track-icon-latest';
      } else {
        className += ' typhoon-track-icon-past';
      }
    }

    if (markerProperties.firstLandfall || markerProperties.closestToLand) {
      className += ' typhoon-track-icon-firstLandfall';
    }

    const dateAndTime = DateTime.fromISO(
      markerProperties.timestampOfTrackpoint,
    ).toFormat('ccc, dd LLLL, HH:mm');

    const category = this.translate.instant(
      'map-popups.PHL.typhoon.category.' + markerProperties.category,
    );

    const coordinate = this.formatAsCoordinate(markerLatLng);

    const markerInstance = marker(markerLatLng, {
      title: dateAndTime,
      icon: divIcon({
        className,
        iconSize: isLatest
          ? [
              this.TYPHOON_TRACK_LATEST_POINT_SIZE,
              this.TYPHOON_TRACK_LATEST_POINT_SIZE,
            ]
          : [
              this.TYPHOON_TRACK_NORMAL_POINT_SIZE,
              this.TYPHOON_TRACK_NORMAL_POINT_SIZE,
            ],
      }),
      zIndexOffset: 700,
    });

    markerInstance.bindPopup(
      this.createMarkerTyphoonTrackPopup(
        dateAndTime,
        category,
        coordinate,
        passed,
      ),
      {
        minWidth: 300,
        className: 'typhoon-track-popup',
      },
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.typhoonTrack),
    );

    return markerInstance;
  }

  private createMarkerRedCrossBranch(
    markerProperties: RedCrossBranch,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.branchName;

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
      this.createMarkerWaterpointPopup(markerProperties, markerLatLng),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.waterPoint),
    );

    return markerInstance;
  }

  private createMarkerEvacuationCenter(
    markerProperties: EvacuationCenter,
    markerLatLng: LatLng,
  ): Marker {
    const markerTitle = markerProperties.evacuationCenterName;

    const markerInstance = marker(markerLatLng, {
      title: markerTitle,
      icon: icon(LEAFLET_MARKER_ICON_OPTIONS_EVACUATION_CENTER),
    });
    markerInstance.bindPopup(
      this.createMarkerEvacuationCenterPopup(markerProperties, markerLatLng),
    );
    markerInstance.on(
      'click',
      this.onMapMarkerClick(AnalyticsEvent.evacuationCenter),
    );

    return markerInstance;
  }

  private createMarkerStationPopup(markerProperties: Station): string {
    const eapAlertClasses =
      (this.country &&
        this.country.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        )?.eapAlertClasses) ||
      ({} as EapAlertClasses);

    const eapAlertClass = eapAlertClasses[markerProperties.eapAlertClass];

    const eapStatusText = eapAlertClass?.label;
    const eapStatusColor = `var(--ion-color-${eapAlertClass?.color})`;
    const eapStatusColorText = `var(--ion-color-${eapAlertClass?.color}-contrast)`;

    const title =
      markerProperties.stationCode +
      ' STATION: ' +
      markerProperties.stationName;

    let lastAvailableLeadTime: LeadTime;
    if (this.country) {
      const leadTimes = this.country.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType.disasterType,
      )?.activeLeadTimes;
      lastAvailableLeadTime = leadTimes[leadTimes.length - 1];
    }

    const leadTime = this.timelineState.activeLeadTime || lastAvailableLeadTime;
    const subtitle = `${leadTime} forecast of <span title="The amount of water moving down a river at a given time and place" style="text-decoration: underline; text-decoration-style: dotted; cursor:default">river discharge</span> in m<sup>3</sup>/s \
          ${
            markerProperties.forecastReturnPeriod
              ? `<br>(Corresponding to a return period of <strong>${markerProperties.forecastReturnPeriod}</strong> years)`
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

  private createMarkerTyphoonTrackPopup(
    dateAndTime: string,
    category: string,
    coordinate: string,
    passed: string,
  ): string {
    const bg = 'var(--ion-color-ibf-primary)';
    const color = 'var(--ion-color-ibf-white)';

    const trackpointInfoPopup = `
      <div style="border: 2px solid ${bg}">
        <div style="background: ${bg}; color: ${color}; padding: 8px; font-size: 14px;">
          <strong>TYPHOON TRACK <span>${passed}</span></strong>
        </div>
        <div style="padding: 8px; display:flex; flex-direction: row; justify-content: space-between;">
        <div>
          <div style="margin-bottom: 8px;">Date and time: <strong>${dateAndTime}</strong></div>
          <div>Category (ECWMF): <strong>${category}</strong></div>
        </div>
        <div>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.8211 16.1286L26.8028 16.0965C26.6224 15.7859 26.3267 15.5591 25.98 15.4655C25.6334 15.372 25.2638 15.4192 24.9518 15.5969L22.8259 16.8254C23.0049 15.3864 22.7191 13.9279 22.0103 12.6631C21.9984 12.6347 21.9847 12.6071 21.9691 12.5806L21.9554 12.5622L17.9831 5.67707C17.894 5.52297 17.7755 5.38791 17.6343 5.27963C17.4931 5.17135 17.3319 5.09196 17.16 5.04598C16.9882 5.00001 16.8089 4.98836 16.6325 5.0117C16.4562 5.03504 16.2861 5.09291 16.1321 5.182L16.0954 5.20034C15.786 5.38181 15.5605 5.67798 15.4679 6.02465C15.3753 6.37131 15.423 6.74054 15.6006 7.05227L16.8239 9.17467C15.3552 8.99448 13.8677 9.29695 12.5859 10.0365L12.5355 10.064L5.67673 14.0291C5.5227 14.1182 5.38772 14.2368 5.27949 14.3781C5.17126 14.5194 5.09191 14.6806 5.04596 14.8526C5.00001 15.0245 4.98837 15.2039 5.01169 15.3803C5.03502 15.5568 5.09286 15.727 5.18191 15.8811L5.20023 15.9132C5.28928 16.0673 5.40779 16.2023 5.54901 16.3106C5.69022 16.4189 5.85137 16.4983 6.02325 16.5442C6.19513 16.5902 6.37438 16.6019 6.55076 16.5785C6.72714 16.5552 6.8972 16.4973 7.05122 16.4082L9.18169 15.1797C9.00449 16.6386 9.3017 18.1158 10.0293 19.3924C10.0319 19.4039 10.0366 19.4147 10.043 19.4245L10.0522 19.4383L14.0245 26.3234C14.2046 26.6344 14.5006 26.8612 14.8477 26.954C15.1947 27.0468 15.5643 26.9981 15.8755 26.8185L15.9122 26.8002C16.2224 26.6195 16.4486 26.3233 16.5413 25.9763C16.634 25.6293 16.5857 25.2597 16.407 24.9482L15.1837 22.8258C16.5925 23.0018 18.0208 22.7291 19.2659 22.0466C19.3212 22.0227 19.3748 21.9951 19.4263 21.964L19.44 21.9549L26.3263 17.9805C26.6357 17.7991 26.8611 17.5029 26.9538 17.1562C27.0464 16.8096 26.9987 16.4403 26.8211 16.1286ZM12.4347 18.0631C12.4301 18.0585 12.4301 18.0539 12.4255 18.0493C11.8868 17.1079 11.7406 15.9921 12.0185 14.9436C12.2963 13.8951 12.9759 12.9983 13.91 12.4476C13.9191 12.4431 13.9329 12.4339 13.942 12.4293C13.9512 12.4247 13.9558 12.4201 13.9649 12.4156C14.9062 11.8793 16.0204 11.7349 17.0671 12.0137C18.1138 12.2924 19.0089 12.9719 19.5591 13.9054C19.5637 13.9145 19.5729 13.9283 19.5775 13.9374C19.5821 13.9466 19.5866 13.9512 19.5912 13.9604C20.1288 14.9084 20.2701 16.0306 19.9843 17.0825C19.6985 18.1343 19.0088 19.0305 18.0655 19.5758C18.0609 19.5804 18.0564 19.5804 18.0518 19.5849C17.1047 20.1261 15.9819 20.2698 14.9291 19.9845C13.8764 19.6993 12.9794 19.0084 12.4347 18.0631Z" fill="${bg}"/>
          </svg>
        </div>
        </div>
        <div style="background: ${bg}; color: ${color}; padding: 8px; text-align: right;">
          <strong>Coordinate: ${coordinate}</strong>
        </div>
      </div>
    `;
    return trackpointInfoPopup;
  }

  private createMarkerRedCrossPopup(markerProperties: RedCrossBranch): string {
    const branchInfoPopup = (
      '<div style="margin-bottom: 5px">' +
      '<strong>Branch: ' +
      markerProperties.branchName +
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
      '<strong>Dam: ' +
      markerProperties.damName +
      '</strong>' +
      '</div>'
    ).concat(
      '<div style="margin-bottom: 5px">' +
        'Full Supply Capacity: ' +
        (Math.round(markerProperties.fullSupplyCapacity).toLocaleString() ||
          '') +
        ' million m<sup>3</sup></div>',
    );
    return branchInfoPopup;
  }

  private createMarkerEvacuationCenterPopup(
    markerProperties: EvacuationCenter,
    markerLatLng: LatLng,
  ): string {
    return `<div style="margin-bottom: 5px"><strong>Evacuation center: ${
      markerProperties.evacuationCenterName
    }</strong></div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      markerLatLng,
    )}
    </div>`;
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

  private formatAsCoordinate(markerLatLng: LatLng) {
    const lat = `${Math.abs(markerLatLng.lat).toFixed(4)}° ${
      markerLatLng.lat > 0 ? 'N' : 'S'
    }`;
    const lng = `${Math.abs(markerLatLng.lng).toFixed(4)}° ${
      markerLatLng.lng > 0 ? 'E' : 'W'
    }`;
    return `${lat}, ${lng}`;
  }

  private createMarkerWaterpointPopup(
    markerProperties: Waterpoint,
    markerLatLng: LatLng,
  ): string {
    return `<div style="margin-bottom: 5px"><strong>ID: ${
      markerProperties.wpdxId
    }</strong></div><div style="margin-bottom: 5px">Waterpoint type: ${
      markerProperties.type || 'unknown'
    }</div><div style="margin-bottom: 5px">Report date: ${
      markerProperties.reportDate
    }</div><div style="margin-bottom: 5px">Coordinate: ${this.formatAsCoordinate(
      markerLatLng,
    )}
    </div>`;
  }

  private calculateClosestPointToTyphoon(layer: IbfLayer) {
    const dates = layer.data?.features
      .filter(
        (f) =>
          DateTime.fromISO(f.properties?.timestampOfTrackpoint) <=
          DateTime.fromISO(this.lastModelRunDate),
      )
      .map((t) => DateTime.fromISO(t.properties?.timestampOfTrackpoint));

    this.closestPointToTyphoon = Math.max.apply(null, dates);
  }
}
