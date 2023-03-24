import { Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@asymmetrik/ngx-leaflet';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import {
  Control,
  divIcon,
  DomUtil,
  geoJSON,
  GeoJSON,
  LatLng,
  LatLngBoundsLiteral,
  Layer,
  Map,
  MapOptions,
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
} from 'src/app/config';
import { Country, DisasterType } from 'src/app/models/country.model';
import {
  CommunityNotification,
  DamSite,
  EvacuationCenter,
  HealthSite,
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
import { PointMarkerService } from '../../services/point-marker.service';
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
  private closestPointToTyphoon: number;

  public legends: { [key: string]: Control } = {};

  private layerSubscription: Subscription;
  private countrySubscription: Subscription;
  private disasterTypeSubscription: Subscription;
  private placeCodeSubscription: Subscription;
  private initialEventStateSubscription: Subscription;
  private manualEventStateSubscription: Subscription;
  private timelineStateSubscription: Subscription;

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
    private pointMarkerService: PointMarkerService,
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
        if (adminRegionsFiltered.features.length) {
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
        this.eventState?.activeTrigger && this.eventState?.thresholdReached
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
        const countryDisasterSettings = this.country?.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        );
        return this.pointMarkerService.createMarkerStation(
          geoJsonPoint.properties as Station,
          latlng,
          countryDisasterSettings,
          this.timelineState.activeLeadTime,
        );
      case IbfLayerName.redCrossBranches:
        return this.pointMarkerService.createMarkerRedCrossBranch(
          geoJsonPoint.properties as RedCrossBranch,
          latlng,
        );
      case IbfLayerName.typhoonTrack:
        return this.pointMarkerService.createMarkerTyphoonTrack(
          geoJsonPoint.properties as TyphoonTrackPoint,
          latlng,
          this.lastModelRunDate,
          this.closestPointToTyphoon,
        );
      case IbfLayerName.damSites:
        return this.pointMarkerService.createMarkerDam(
          geoJsonPoint.properties as DamSite,
          latlng,
        );
      case IbfLayerName.waterpoints:
        return this.pointMarkerService.createMarkerWaterpoint(
          geoJsonPoint.properties as Waterpoint,
          latlng,
        );
      case IbfLayerName.healthSites:
        return this.pointMarkerService.createMarkerHealthSite(
          geoJsonPoint.properties as HealthSite,
          latlng,
        );
      case IbfLayerName.evacuationCenters:
        return this.pointMarkerService.createMarkerEvacuationCenter(
          geoJsonPoint.properties as EvacuationCenter,
          latlng,
        );
      case IbfLayerName.communityNotifications:
        return this.pointMarkerService.createMarkerCommunityNotification(
          geoJsonPoint.properties as CommunityNotification,
          latlng,
        );
      default:
        return this.pointMarkerService.createMarkerDefault(latlng);
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
      eventName: feature.properties.eventName,
    });
  };

  private onAdminRegionClickByLayerAndFeatureAndElement = (
    feature,
    element,
  ) => (): void => {
    this.analyticsService.logEvent(AnalyticsEvent.mapPlaceSelect, {
      placeCode: feature.properties.placeCode,
      page: AnalyticsPage.dashboard,
      isActiveTrigger: this.eventService.state.activeTrigger,
      component: this.constructor.name,
    });

    // if click in overview-mode
    if (!this.eventState.event) {
      // go to event-mode, but don't set placeCode
      if (feature.properties.eventName) {
        const event = this.eventState?.events?.find(
          (e) => e.eventName === feature.properties.eventName,
        );
        this.timelineService.handleTimeStepButtonClick(
          event.firstLeadTime as LeadTime,
          event.eventName,
        );
        this.eventService.switchEvent(feature.properties.eventName);
      }
    } else if (this.eventState.event) {
      // in in event-mode, then set placeCode
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
        if (feature.properties.eventName) {
        }
      }
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
          const leadTimes = this.country?.countryDisasterSettings.find(
            (s) => s.disasterType === this.disasterType?.disasterType,
          )?.activeLeadTimes;
          popup = this.pointMarkerService.createThresHoldPopupAdminRegions(
            activeAggregateLayer,
            feature,
            thresholdValue,
            leadTimes,
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
