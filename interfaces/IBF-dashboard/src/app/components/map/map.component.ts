import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { LeafletControlLayersConfig } from '@bluehalo/ngx-leaflet';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import {
  Control,
  divIcon,
  DomUtil,
  GeoJSON,
  geoJSON,
  LatLng,
  LatLngBoundsLiteral,
  Layer,
  Map,
  MapOptions,
  Marker,
  MarkerCluster,
  MarkerClusterGroup,
  markerClusterGroup,
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
import {
  Country,
  CountryDisasterSettings,
  DisasterType,
} from 'src/app/models/country.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import {
  CommunityNotification,
  DamSite,
  EvacuationCenter,
  HealthSite,
  RedCrossBranch,
  RiverGauge,
  School,
  Station,
  TyphoonTrackPoint,
  Waterpoint,
  WaterpointInternal,
} from 'src/app/models/poi.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { Event, EventService } from 'src/app/services/event.service';
import { MapService } from 'src/app/services/map.service';
import { MapLegendService } from 'src/app/services/map-legend.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { PointMarkerService } from 'src/app/services/point-marker.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import {
  IbfLayer,
  IbfLayerGroup,
  IbfLayerName,
  IbfLayerType,
  LeafletPane,
} from 'src/app/types/ibf-layer';
import { LeadTime } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: false,
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map: Map;
  public layers: IbfLayer[] = [];
  private placeCode: PlaceCode;
  private country: Country;
  private disasterType: DisasterType;
  private countryDisasterSettings: CountryDisasterSettings;
  public lastUploadDate: string;
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
        newLayer.data ||
        [IbfLayerType.wms, IbfLayerType.line].includes(newLayer.type)
          ? this.createLayer(newLayer)
          : newLayer;

      if (newLayer.viewCenter) {
        this.zoomToArea();
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
    this.countryDisasterSettings =
      this.disasterTypeService.getCountryDisasterTypeSettings(
        this.country,
        this.disasterType,
      );
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    this.timelineState = timelineState;

    this.lastUploadDate = this.timelineState?.today.toUTC().toString();
  };

  private onEventStateChange = (eventState: EventState) => {
    this.eventState = eventState;
  };

  private onPlaceCodeChange = (placeCode: PlaceCode): void => {
    this.placeCode = placeCode;

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
        if (this.placeCode) {
          adminRegionsFiltered.features =
            adminRegionsLayer.data?.features.filter(
              (area) =>
                area?.properties?.['placeCode'] === this.placeCode.placeCode ||
                area?.properties?.['placeCodeParent'] ===
                  this.placeCode.placeCode,
            );
        } else {
          adminRegionsFiltered.features = adminRegionsLayer.data?.features;
        }
        if (adminRegionsFiltered.features.length) {
          const layerBounds = bbox(adminRegionsFiltered);
          const layerWidth = layerBounds[2] - layerBounds[0];
          const layerHeight = layerBounds[3] - layerBounds[1];
          const zoomExtraOffset = 0.1; //10% margin of height and width on all sides
          this.mapService.state.bounds = containsNumber(layerBounds)
            ? ([
                [
                  layerBounds[1] - zoomExtraOffset * layerHeight,
                  layerBounds[0] - zoomExtraOffset * layerWidth,
                ],
                [
                  layerBounds[3] + zoomExtraOffset * layerHeight,
                  layerBounds[2] + zoomExtraOffset * layerWidth,
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

  private initLegend() {
    this.legend = new Control();
    this.legend.setPosition('bottomleft');
    this.legend.onAdd = () => {
      this.legendDiv = DomUtil.create('div', 'info legend invisible');
      this.legendDiv.innerHTML += this.mapLegendService.getLegendTitle();
      return this.legendDiv;
    };

    this.legend.addTo(this.map);
  }

  private updateLegend() {
    if (!this.legendDiv) {
      return;
    }

    // show zoom control and legend when layers are shown
    if (!this.map.options.zoomControl) {
      this.map.options.zoomControl = true;
      this.map.addControl(new Control.Zoom());
      this.legendDiv.classList.remove('invisible');
    }

    const layersToShow = this.layers
      .filter((l) => l.active && l.group !== IbfLayerGroup.adminRegions)
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.name === value.name),
      ); // deduplicate based on name (for e.g. waterpoints_internal)

    let detailsString = `<details data-testid="map-legend" open><summary><div data-testid="map-legend-header" class="legend-header">${this.mapLegendService.getLegendTitle()}
    <ion-icon class="icon-down" name="chevron-down-outline"></ion-icon>
    <ion-icon class="icon-up" name="chevron-up-outline"></ion-icon></div>
    </summary>`;
    const sortedLayersToShow = layersToShow.sort((a, b) => a.order - b.order);
    for (const layer of sortedLayersToShow) {
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
                `-${glofasState.key}-trigger`,
                glofasState.label,
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
        case IbfLayerType.wms || IbfLayerType.line:
          elements.push(this.mapLegendService.getWmsLegendString(layer));
          break;
        default:
          elements.push(`<p id='legend-${layer.name}'>${layer.label}</p>`);
          break;
      }

      for (const element of elements) {
        detailsString += element;
      }
    }
    detailsString += '</details>';

    this.legendDiv.innerHTML = detailsString;
  }

  private isMultiLinePointLayer(layerName: IbfLayerName): boolean {
    return (
      [
        IbfLayerName.healthSites,
        IbfLayerName.schools,
        IbfLayerName.waterpointsInternal,
      ].includes(layerName) &&
      this.disasterType.disasterType === DisasterTypeKey.flashFloods &&
      this.eventState.events?.length > 0
    );
  }

  private getGlofasStationStates() {
    const classes = [];
    for (const [key, value] of Object.entries(
      this.countryDisasterSettings?.eapAlertClasses,
    )) {
      classes.push({ key, label: value.label, value: value.value });
    }
    classes.sort((e1, e2) => {
      return e2.value - e1.value;
    });
    return classes;
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
        const extraLayer = Object.assign({}, layer);
        extraLayer.leafletLayer = pointLayer;
        this.layers.push(extraLayer);
      }
    }

    if (layer.type === IbfLayerType.shape) {
      layer.leafletLayer = this.createAdminRegionsLayer(layer);
      this.layers.push(layer);
    }

    if (layer.type === IbfLayerType.wms || layer.type === IbfLayerType.line) {
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

  private getPointToLayerByLayer =
    (layerName) =>
    (geoJsonPoint: GeoJSON.Feature, latlng: LatLng): Marker => {
      switch (layerName) {
        case IbfLayerName.glofasStations: {
          return this.pointMarkerService.createMarkerStation(
            geoJsonPoint.properties as Station,
            latlng,
            this.countryDisasterSettings,
            this.eventState?.events,
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
            this.lastUploadDate,
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
        case IbfLayerName.gauges:
          return this.pointMarkerService.createMarkerRiverGauges(
            geoJsonPoint.properties as RiverGauge,
            latlng,
          );
        default:
          return this.pointMarkerService.createMarkerDefault(latlng);
      }
    };

  private getIconCreateFunction = (cluster: MarkerCluster) => {
    const clusterSize = cluster.getChildCount();

    const exposedClass = cluster
      .getAllChildMarkers()
      .some((marker) => marker.feature.properties.dynamicData?.exposure)
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
        (f) => f.properties.dynamicData?.exposure,
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
        (f) => !f.properties.dynamicData?.exposure,
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
      layer.data.features.length > 1000 // TODO: ugly filter to differentiate between countries
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

  private onAdminRegionMouseOver =
    (feature) =>
    (event): void => {
      event.target.setStyle(
        this.mapService.setAdminRegionMouseOverStyle(
          feature.properties.placeCode,
          feature.properties.placeCodeParent,
        ),
      );
      this.placeCodeService.setPlaceCodeHover({
        countryCodeISO3: feature.properties.countryCodeISO3,
        placeCode: feature.properties.placeCode,
        placeCodeName: feature.properties.name,
        placeCodeParentName: feature.properties.nameParent,
        eventName: feature.properties.eventName,
        adminLevel: feature.properties.adminLevel,
      });
    };

  private onAdminRegionClickByLayerAndFeatureAndElement =
    (feature) => (): void => {
      const adminLevel: number = feature.properties.adminLevel;
      const placeCode: string = feature.properties.placeCode;

      this.analyticsService.logEvent(AnalyticsEvent.mapPlaceSelect, {
        placeCode,
        page: AnalyticsPage.dashboard,
        isActiveTrigger: this.eventService.state.events?.length > 0,
        component: this.constructor.name,
      });

      // if click in overview-mode
      if (!this.eventState.event) {
        // go to event-view, but don't set placeCode
        if (feature.properties.eventName) {
          const event = this.eventState?.events?.find(
            (e) => e.eventName === feature.properties.eventName,
          );
          this.eventService.switchEvent(feature.properties.eventName);
          this.timelineService.setTimelineState(
            event?.firstTriggerLeadTime || event?.firstLeadTime,
            event?.eventName,
          );
        }
      } else if (this.eventState.event) {
        // if in event-view, then set placeCode
        if (placeCode !== this.placeCode?.placeCode) {
          // only zoom-in when actually zooming in (instead of selecting a peer-area on the same level)
          const zoomIn = adminLevel > (Number(this.placeCode?.adminLevel) || 0);
          if (zoomIn) {
            this.adminLevelService.zoomInAdminLevel();
          }
          this.placeCodeService.setPlaceCode({
            placeCode,
            countryCodeISO3: feature.properties.countryCodeISO3,
            placeCodeName: feature.properties.name,
            placeCodeParent: zoomIn
              ? this.placeCode
              : this.placeCode?.placeCodeParent,
            placeCodeParentName: feature.properties.nameParent,
            adminLevel,
            eventName: feature.properties.eventName,
          });
        }
      }
    };
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
            this.onAdminRegionClickByLayerAndFeatureAndElement(feature),
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
        : [new Event()];

    for (const event of events) {
      const leadTime = !layer.wms.leadTimeDependent
        ? null
        : !this.eventState.event && event.firstLeadTime
          ? event.firstLeadTime
          : this.timelineState.activeLeadTime;

      const nameLeadTimePart = leadTime ? `_${leadTime}` : '';
      const nameCountryPart =
        layer.type === IbfLayerType.line
          ? ''
          : `_${this.country.countryCodeISO3}`;
      const name = `ibf-system:${layer.name}${nameLeadTimePart}${nameCountryPart}`;

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
          DateTime.fromISO(this.lastUploadDate),
      )
      .map((t) => DateTime.fromISO(t.properties?.['timestampOfTrackpoint']));

    this.closestPointToTyphoon = Math.max.apply(null, dates);
  }
}
