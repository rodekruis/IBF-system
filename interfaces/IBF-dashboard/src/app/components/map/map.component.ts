import { AfterViewInit, Component, OnDestroy } from '@angular/core';
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
  School,
  Station,
  TyphoonTrackPoint,
  Waterpoint,
  WaterpointInternal,
} from 'src/app/models/poi.model';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { EventService, EventSummary } from 'src/app/services/event.service';
import { MapLegendService } from 'src/app/services/map-legend.service';
import { MapService } from 'src/app/services/map.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { EventState } from 'src/app/types/event-state';
import {
  IbfLayer,
  IbfLayerGroup,
  IbfLayerName,
  IbfLayerType,
  LeafletPane,
} from 'src/app/types/ibf-layer';
import { NumberFormat } from 'src/app/types/indicator-group';
import { LeadTime } from 'src/app/types/lead-time';
import { PlaceCode } from '../../models/place-code.model';
import { AdminLevelService } from '../../services/admin-level.service';
import { DisasterTypeService } from '../../services/disaster-type.service';
import { PointMarkerService } from '../../services/point-marker.service';
import { DisasterTypeKey } from '../../types/disaster-type-key';
import { TimelineState } from '../../types/timeline-state';
import { IbfLayerThreshold } from './../../types/ibf-layer';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map: Map;
  public layers: IbfLayer[] = [];
  private placeCode: string;
  private country: Country;
  private disasterType: DisasterType;
  public lastModelRunDate: string;
  public eventState: EventState;
  public timelineState: TimelineState;
  private closestPointToTyphoon: number;

  public legend: Control;
  private legendDiv: HTMLElement;

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
    private mapLegendService: MapLegendService,
    private adminLevelService: AdminLevelService,
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
  ngAfterViewInit(): void {
    if (this.map) {
      this.initLegend();
    }
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

  private onLayerChange = (newLayer) => {
    if (newLayer) {
      newLayer =
        newLayer.data || newLayer.type === IbfLayerType.wms
          ? this.createLayer(newLayer)
          : newLayer;

      if (newLayer.viewCenter) {
        this.map.fitBounds(this.mapService.state.bounds);
      }
    } else {
      this.layers = [];
    }
    this.addToLayersControl();

    this.triggerWindowResize();

    this.updateLegend();
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
            (area) => area?.properties?.['placeCode'] === this.placeCode,
          );
          zoomExtraOffset = 0.1;
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
      if (d > 10000000) {
        return Math.round(d / 1000000).toLocaleString() + 'M';
      } else if (d > 1000000) {
        return (Math.round(d / 100000) / 10).toLocaleString() + 'M';
      } else if (d > 10000) {
        return Math.round(d / 1000).toLocaleString() + 'k';
      } else if (d > 1000) {
        return (Math.round(d / 100) / 10).toLocaleString() + 'k';
      } else {
        return Math.round(d).toLocaleString();
      }
    } else {
      return Math.round(d).toLocaleString();
    }
  }

  private initLegend() {
    this.legend = new Control();
    this.legend.setPosition('bottomleft');
    this.legend.onAdd = () => {
      this.legendDiv = DomUtil.create('div', 'info legend');
      this.legendDiv.innerHTML += this.mapLegendService.getLegendTitle();
      return this.legendDiv;
    };

    this.legend.addTo(this.map);
  }

  private updateLegend() {
    if (!this.legendDiv) {
      return;
    }

    const layersToShow = this.layers
      .filter((l) => l.active && l.group !== IbfLayerGroup.adminRegions)
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name),
      ); // deduplicate based on name (for e.g. waterpoints_internal)

    this.legendDiv.innerHTML = this.mapLegendService.getLegendTitle();
    for (const layer of layersToShow.sort(this.sortLayers)) {
      const elements = [];
      switch (layer.type) {
        case IbfLayerType.point:
          if (this.isMultiLinePointLayer(layer.name)) {
            for (const exposed of [false, true]) {
              const element = this.mapLegendService.getPointLegendString(
                layer,
                exposed,
              );
              elements.push(element);
            }
          } else if (layer.name === IbfLayerName.glofasStations) {
            for (const glofasState of this.getGlofasStationStates()) {
              const element = this.mapLegendService.getGlofasPointLegendString(
                layer,
                `-${glofasState}-trigger`,
              );
              elements.push(element);
            }
          } else {
            const element = this.mapLegendService.getPointLegendString(
              layer,
              false,
            );
            elements.push(element);
          }
          break;
        case IbfLayerType.shape:
          elements.push(this.mapLegendService.getShapeLegendString(layer));
          break;
        case IbfLayerType.wms:
          elements.push(this.mapLegendService.getWmsLegendString(layer));
          break;
        default:
          elements.push(`<p id='legend-${layer.name}'>${layer.label}</p>`);
          break;
      }

      for (const element of elements) {
        this.legendDiv.innerHTML += element;
      }
    }
  }

  private isMultiLinePointLayer(layerName: IbfLayerName): boolean {
    return (
      [
        IbfLayerName.waterpointsInternal,
        IbfLayerName.healthSites,
        IbfLayerName.schools,
      ].includes(layerName) &&
      this.disasterType.disasterType === DisasterTypeKey.flashFloods &&
      this.eventState.activeTrigger
    );
  }

  private getGlofasStationStates() {
    return Object.keys(
      this.country?.countryDisasterSettings.find(
        (s) => s.disasterType === this.disasterType?.disasterType,
      )?.eapAlertClasses,
    );
  }

  onMapReady(map: Map) {
    this.map = map;
    this.map.createPane(LeafletPane.wmsPane);
    this.map.createPane(LeafletPane.adminBoundaryPane);
    this.map.createPane(LeafletPane.outline);
    this.map.createPane(LeafletPane.aggregatePane);
    this.triggerWindowResize();
  }

  private createLayer(layer: IbfLayer): IbfLayer {
    this.layers = this.layers.filter((l) => l.name !== layer.name);

    if (layer.type === IbfLayerType.point) {
      const pointLayers = this.createPointLayer(layer);

      for (const pointLayer of pointLayers) {
        const extraLayer = { ...layer };
        extraLayer.leafletLayer = pointLayer;
        this.layers.push(extraLayer);
      }
    }

    if (layer.type === IbfLayerType.shape) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);
      this.layers.push(layer);
    }

    if (layer.type === IbfLayerType.wms) {
      layer.leafletLayer = this.createWmsLayer(layer);
      this.layers.push(layer);
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
      case IbfLayerName.glofasStations: {
        const countryDisasterSettings = this.country?.countryDisasterSettings.find(
          (s) => s.disasterType === this.disasterType.disasterType,
        );
        return this.pointMarkerService.createMarkerStation(
          geoJsonPoint.properties as Station,
          latlng,
          countryDisasterSettings,
          this.timelineState.activeLeadTime,
        );
      }
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
      case IbfLayerName.schools:
        return this.pointMarkerService.createMarkerSchool(
          geoJsonPoint.properties as School,
          latlng,
        );
      case IbfLayerName.waterpointsInternal:
        return this.pointMarkerService.createMarkerWaterpointInternal(
          geoJsonPoint.properties as WaterpointInternal,
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

    const exposedClass = cluster
      .getAllChildMarkers()
      .some((marker) => marker.feature.properties.exposed)
      ? ' exposed'
      : '';

    let size: number;
    let className: string;
    switch (true) {
      case clusterSize <= 10:
        size = 30;
        className = `waterpoint-cluster-10${exposedClass}`;
        break;
      case clusterSize < 100:
        size = 40;
        className = `waterpoint-cluster-100${exposedClass}`;
        break;
      case clusterSize < 1000:
        size = 60;
        className = `waterpoint-cluster-1000${exposedClass}`;
        break;
      default:
        size = 80;
        className = `waterpoint-cluster-10000${exposedClass}`;
        break;
    }
    return divIcon({
      html: '<b>' + String(clusterSize) + '</b>',
      className,
      iconSize: point(size, size),
    });
  };

  private createPointLayer(layer: IbfLayer): GeoJSON[] | MarkerClusterGroup[] {
    if (!layer.data) {
      return;
    }

    if (layer.name === IbfLayerName.typhoonTrack) {
      this.calculateClosestPointToTyphoon(layer);
    }
    const mapLayer = geoJSON(layer.data, {
      pointToLayer: this.getPointToLayerByLayer(layer.name),
    });

    if (
      [IbfLayerName.waterpoints, IbfLayerName.waterpointsInternal].includes(
        layer.name,
      )
    ) {
      // construct exposed marker clusters
      const exposedWaterPointClusterLayer = markerClusterGroup({
        iconCreateFunction: this.getIconCreateFunction,
        maxClusterRadius: 50,
      });
      const exposedLayerData = JSON.parse(JSON.stringify(layer.data));
      exposedLayerData.features = exposedLayerData.features.filter(
        (f) => f.properties.exposed,
      );
      const mapLayerExposed = geoJSON(exposedLayerData, {
        pointToLayer: this.getPointToLayerByLayer(layer.name),
      });
      exposedWaterPointClusterLayer.addLayer(mapLayerExposed);

      // construct not-exposed marker clusters
      const notExposedWaterPointClusterLayer = markerClusterGroup({
        iconCreateFunction: this.getIconCreateFunction,
        maxClusterRadius: 50,
      });
      const nonExposedLayerData = JSON.parse(JSON.stringify(layer.data));
      nonExposedLayerData.features = nonExposedLayerData.features.filter(
        (f) => !f.properties.exposed,
      );
      const mapLayerNotExposed = geoJSON(nonExposedLayerData, {
        pointToLayer: this.getPointToLayerByLayer(layer.name),
      });
      notExposedWaterPointClusterLayer.addLayer(mapLayerNotExposed);

      // return both
      return [exposedWaterPointClusterLayer, notExposedWaterPointClusterLayer];
    }

    if (
      layer.name === IbfLayerName.healthSites &&
      layer.data.features.length > 1000 // TO DO: ugly filter to differentiate between countries
    ) {
      const healthSiteClusterLayer = markerClusterGroup({
        iconCreateFunction: this.getIconCreateFunction,
        maxClusterRadius: 10,
      });
      healthSiteClusterLayer.addLayer(mapLayer);
      return [healthSiteClusterLayer];
    }
    return [mapLayer];
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
      // go to event-view, but don't set placeCode
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
      // if in event-view, then set placeCode
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
          eventName: feature.properties.eventName,
        });
      }
      this.adminLevelService.zoomInAdminLevel();
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
          popup = this.createThresHoldPopupAdminRegions(
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

  public createThresHoldPopupAdminRegions(
    layer: IbfLayer,
    feature,
    thresholdValue: number,
    leadTimes: LeadTime[],
  ): string {
    const properties = 'properties';
    const forecastValue = feature[properties][layer.colorProperty];
    const featureTriggered = forecastValue > thresholdValue;
    const headerTextColor = featureTriggered
      ? 'var(--ion-color-ibf-trigger-alert-primary-contrast)'
      : 'var(--ion-color-ibf-no-alert-primary-contrast)';
    const title = feature.properties.name;

    const lastAvailableLeadTime: LeadTime = leadTimes[leadTimes.length - 1];

    const timeUnit = lastAvailableLeadTime.split('-')[1];

    const subtitle = `${layer.label} for current ${timeUnit} selected`;
    const eapStatusColor = featureTriggered
      ? 'var(--ion-color-ibf-trigger-alert-primary)'
      : 'var(--ion-color-ibf-no-alert-primary)';
    const eapStatusText = featureTriggered
      ? 'ACTIVATE EARLY ACTIONS'
      : 'No action';
    const thresholdName = 'Alert threshold';

    return this.pointMarkerService.createThresholdPopup(
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

  private createDefaultPopupAdminRegions(
    activeAggregateLayer: IbfLayer,
    feature,
  ): string {
    feature = activeAggregateLayer.data?.features.find(
      (f) => f.properties?.['placeCode'] === feature.properties.placeCode,
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

  private createWmsLayer(layer: IbfLayer): Layer {
    if (!layer.wms) {
      return;
    }
    const layerNames = [];
    const events = this.eventState.event
      ? [this.eventState.event]
      : this.eventState.events.length > 0
      ? this.eventState.events
      : [new EventSummary()];

    for (const event of events) {
      const leadTime = !layer.wms.leadTimeDependent
        ? null
        : !this.eventState.event && event.firstLeadTime
        ? event.firstLeadTime
        : this.timelineState.activeLeadTime;

      const name = `ibf-system:${layer.name}_${leadTime ? `${leadTime}_` : ''}${
        this.country.countryCodeISO3
      }`;
      if (!layerNames.includes(name)) {
        layerNames.push(name);
      }
    }
    const wmsOptions = {
      pane: LeafletPane.wmsPane,
      layers: layerNames.join(','),
      format: layer.wms.format,
      version: layer.wms.version,
      attribution: layer.wms.attribution,
      crs: layer.wms.crs,
      transparent: layer.wms.transparent,
      viewparams: layer.wms.viewparams,
    };
    return tileLayer.wms(layer.wms.url, wmsOptions);
  }

  private calculateClosestPointToTyphoon(layer: IbfLayer) {
    const dates = layer.data?.features
      .filter(
        (f) =>
          DateTime.fromISO(f.properties?.['timestampOfTrackpoint']) <=
          DateTime.fromISO(this.lastModelRunDate),
      )
      .map((t) => DateTime.fromISO(t.properties?.['timestampOfTrackpoint']));

    this.closestPointToTyphoon = Math.max.apply(null, dates);
  }

  private sortLayers = (a: IbfLayer, b: IbfLayer) =>
    a.order > b.order ? 1 : a.order === b.order ? 0 : -1;
}
