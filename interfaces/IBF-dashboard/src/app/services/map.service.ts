import { Injectable, OnDestroy } from '@angular/core';
import bbox from '@turf/bbox';
import { containsNumber } from '@turf/invariant';
import { CRS, LatLngBoundsLiteral } from 'leaflet';
import { BehaviorSubject, Observable, of, zip, Subject } from 'rxjs';
import { map, shareReplay, distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';
import { Country, DisasterType } from 'src/app/models/country.model';
import { LayerActivation } from 'src/app/models/layer-activation.enum';
import { breakKey } from 'src/app/models/map.model';
import { PlaceCode } from 'src/app/models/place-code.model';
import { AdminLevelService } from 'src/app/services/admin-level.service';
import { AlertAreaService } from 'src/app/services/alert-area.service';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { DisasterTypeService } from 'src/app/services/disaster-type.service';
import { AlertLevel, EventService } from 'src/app/services/event.service';
import { PlaceCodeService } from 'src/app/services/place-code.service';
import { TimelineService } from 'src/app/services/timeline.service';
import { DebugService } from 'src/app/services/debug.service';
import { AdminLevel, AdminLevelType } from 'src/app/types/admin-level';
import { AlertArea } from 'src/app/types/alert-area';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { EventState } from 'src/app/types/event-state';
import {
  ColorBreaks,
  IbfLayer,
  IbfLayerGroup,
  IbfLayerLabel,
  IbfLayerMetadata,
  IbfLayerName,
  IbfLayerType,
  IbfLayerWMS,
} from 'src/app/types/ibf-layer';
import { Indicator } from 'src/app/types/indicator-group';
import { LeadTime } from 'src/app/types/lead-time';
import { TimelineState } from 'src/app/types/timeline-state';
import { environment } from 'src/environments/environment';
import { quantile } from 'src/shared/utils';

@Injectable({ providedIn: 'root' })
export class MapService implements OnDestroy {
  private layerSubject = new BehaviorSubject<IbfLayer>(null);
  public layers = [] as IbfLayer[];
  private triggeredAreaColor = 'var(--ion-color-ibf-outline-red)';
  private nonTriggeredAreaColor = 'var(--ion-color-ibf-no-alert-primary)';
  private layerDataCache: Record<string, GeoJSON.FeatureCollection> = {};

  // Granular loading for specific layer types
  private destroy$ = new Subject<void>();

  public state = {
    bounds: [
      [-20, -20],
      [20, 20],
    ] as LatLngBoundsLiteral,
    colorGradientNoAlert: [
      '#F2F5FD',
      '#D6E0FA',
      '#A0B6EB',
      '#3D66B4',
      '#0E357B',
    ],
    colorGradientAlert: ['#F3F0FF', '#C8BAF5', '#A38CEC', '#7B59E2', '#4F22D7'],
    defaultFillColor: '#A0B6EB',
    strokeColor: '#969696',
    noDataColor: '#d3dae0',
    transparentColor: 'transparent',
    defaultFillOpacity: 0.8,
    defaultWeight: 1,
  };

  public eventState: EventState;
  public timelineState: TimelineState;
  public adminLevel: AdminLevel;
  public alertAreas: AlertArea[];

  private country: Country;
  private disasterType: DisasterType;
  private placeCode: PlaceCode;

  constructor(
    private countryService: CountryService,
    private adminLevelService: AdminLevelService,
    private timelineService: TimelineService,
    private apiService: ApiService,
    private eventService: EventService,
    private placeCodeService: PlaceCodeService,
    private disasterTypeService: DisasterTypeService,
    private alertAreaService: AlertAreaService,
    private debugService: DebugService,
  ) {
    this.debugService.logComponentInit('MapService');

    // Granular subscriptions - each service loads only its required layers
    this.countryService
      .getCountrySubscription()
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.countryCodeISO3 === curr?.countryCodeISO3),
        takeUntil(this.destroy$)
      )
      .subscribe(this.onCountryChange);

    this.adminLevelService
      .getAdminLevelSubscription()
      .pipe(
        distinctUntilChanged(),
        debounceTime(100), // Prevent rapid admin level changes
        takeUntil(this.destroy$)
      )
      .subscribe(this.onAdminLevelChange);

    this.disasterTypeService
      .getDisasterTypeSubscription()
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.disasterType === curr?.disasterType),
        debounceTime(100), // Prevent rapid disaster type changes
        takeUntil(this.destroy$)
      )
      .subscribe(this.onDisasterTypeChange);

    this.timelineService
      .getTimelineStateSubscription()
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.activeLeadTime === curr?.activeLeadTime),
        takeUntil(this.destroy$)
      )
      .subscribe(this.onTimelineStateChange);

    this.eventService
      .getInitialEventStateSubscription()
      .pipe(
        distinctUntilChanged((prev, curr) => 
          prev?.event?.eventName === curr?.event?.eventName
        ),
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(this.onEventStateChange);

    this.eventService
      .getManualEventStateSubscription()
      .pipe(
        distinctUntilChanged((prev, curr) => 
          prev?.event?.eventName === curr?.event?.eventName
        ),
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(this.onEventStateChange);

    this.alertAreaService.getAlertAreas()
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(this.onAlertAreasChange);

    this.placeCodeService
      .getPlaceCodeSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.onPlaceCodeChange);
  }

  private onCountryChange = (country: Country): void => {
    console.log(`🏛️ MapService: Country changed to ${country?.countryCodeISO3} - loading admin layers`);
    this.country = country;
    this.loadAdminAreaLayers();
  };

  private onDisasterTypeChange = (disasterType: DisasterType) => {
    console.log(`🌪️ MapService: Disaster type changed to ${disasterType?.disasterType} - loading disaster-specific layers`);
    this.disasterType = disasterType;
    this.loadDisasterSpecificLayers();
  };

  private onAdminLevelChange = (adminLevel: AdminLevel) => {
    console.log(`� MapService: Admin level changed to ${adminLevel} - loading admin region layers`);
    this.adminLevel = adminLevel;
    this.loadAdminRegionLayers();
  };

  private onTimelineStateChange = (timelineState: TimelineState) => {
    console.log(`⏰ MapService: Timeline state changed - loading timeline layers`);
    this.timelineState = timelineState;
    this.loadTimelineLayers();
  };

  private onEventStateChange = (eventState: EventState) => {
    console.log(`� MapService: Event state changed - loading event layers`);
    this.eventState = eventState;
    this.loadEventLayers();
  };

  private onAlertAreasChange = (alertAreas: AlertArea[]) => {
    console.log(`⚠️ MapService: Alert areas changed (${alertAreas?.length} areas) - loading alert layers`);
    this.alertAreas = alertAreas;
    this.loadAlertLayers();
  };

  private onPlaceCodeChange = (placeCode: PlaceCode): void => {
    this.placeCode = placeCode;
  };

  /**
   * Load only admin boundary layers (triggered by country changes)
   */
  private loadAdminAreaLayers(): void {
    if (!this.country) {
      console.log('🏛️ MapService: Skipping admin area layers - no country selected');
      return;
    }

    console.log(`🏛️ MapService: Loading admin area layers for ${this.country.countryCodeISO3}`);
    
    // Load admin region layers for the current admin level
    if (this.adminLevel) {
      this.loadAdminRegionLayers();
    }
  }

  /**
   * Load only disaster-specific layers (triggered by disaster type changes)
   */
  private loadDisasterSpecificLayers(): void {
    if (!this.country || !this.disasterType) {
      console.log('🌪️ MapService: Skipping disaster-specific layers - missing country or disaster type');
      return;
    }

    console.log(`🌪️ MapService: Loading disaster-specific layers for ${this.country.countryCodeISO3} - ${this.disasterType.disasterType}`);
    
    // Load the metadata layers for this country/disaster combination
    this.apiService
      .getLayers(this.country.countryCodeISO3, this.disasterType.disasterType)
      .pipe(takeUntil(this.destroy$))
      .subscribe((layers) => {
        console.log(`🌪️ MapService: Received ${layers.length} disaster-specific layer definitions`);
        this.onLayerChange(layers);
      });
  }

  /**
   * Load only admin region layers (triggered by admin level changes)
   */
  private loadAdminRegionLayers(): void {
    if (!this.adminLevel) {
      console.log('📊 MapService: Skipping admin region layers - no admin level selected');
      return;
    }

    console.log(`� MapService: Loading admin region layers for level ${this.adminLevel}`);
    
    // Load appropriate admin region layer based on current admin level
    this.loadAdminRegionLayer(true, this.adminLevel);
  }

  /**
   * Load only timeline-dependent layers (triggered by timeline changes)
   */
  private loadTimelineLayers(): void {
    if (!this.timelineState || !this.country || !this.disasterType) {
      console.log('⏰ MapService: Skipping timeline layers - missing dependencies');
      return;
    }

    console.log(`⏰ MapService: Loading timeline layers for leadTime ${this.timelineState.activeLeadTime}`);
    
    // Reload any time-dependent layers (WMS layers with leadTimeDependent = true)
    // This will be handled by the existing layer loading mechanism
    this.reloadTimeDependentLayers();
  }

  /**
   * Load only event-specific layers (triggered by event state changes)
   */
  private loadEventLayers(): void {
    if (!this.eventState) {
      console.log('� MapService: Skipping event layers - no event state');
      return;
    }

    console.log(`� MapService: Loading event layers for event ${this.eventState?.event?.eventName || 'none'}`);
    
    // Reload admin regions to reflect event-specific trigger data
    if (this.adminLevel) {
      this.loadAdminRegionLayer(true, this.adminLevel);
    }
    
    // Load typhoon track if applicable
    this.reloadEventSpecificLayers();
  }

  /**
   * Load only alert area layers (triggered by alert area changes)
   */
  private loadAlertLayers(): void {
    if (!this.alertAreas) {
      console.log('⚠️ MapService: Skipping alert layers - no alert areas');
      return;
    }

    console.log(`⚠️ MapService: Loading alert layers for ${this.alertAreas.length} alert areas`);
    
    // Reload layers that depend on alert areas
    this.reloadAlertDependentLayers();
  }

  /**
   * Helper method to reload time-dependent layers
   */
  private reloadTimeDependentLayers(): void {
    // Find and reload WMS layers that are time-dependent
    const timeDependentLayers = this.layers.filter(layer => 
      layer.type === IbfLayerType.wms && layer.wms?.leadTimeDependent
    );
    
    timeDependentLayers.forEach(layer => {
      console.log(`⏰ Reloading time-dependent layer: ${layer.name}`);
      // The layer will be updated through the normal layer update mechanism
    });
  }

  /**
   * Helper method to reload event-specific layers
   */
  private reloadEventSpecificLayers(): void {
    // Reload typhoon track if present
    const typhoonLayer = this.layers.find(layer => layer.name === IbfLayerName.typhoonTrack);
    if (typhoonLayer) {
      console.log(`� Reloading typhoon track layer`);
      this.loadTyphoonTrackLayer(
        { name: IbfLayerName.typhoonTrack } as IbfLayerMetadata, 
        typhoonLayer.active
      );
    }
  }

  /**
   * Helper method to reload alert-dependent layers  
   */
  private reloadAlertDependentLayers(): void {
    // Reload outline layers that depend on alert areas
    const outlineLayers = this.layers.filter(layer => 
      layer.group === IbfLayerGroup.outline
    );
    
    outlineLayers.forEach(layer => {
      console.log(`⚠️ Reloading alert-dependent layer: ${layer.name}`);
      // The layer will be updated through the normal layer update mechanism
    });
  }

  private getPopoverText(indicator: IbfLayerMetadata | Indicator): string {
    if (
      indicator.description?.[this.country.countryCodeISO3]?.[
        this.disasterType.disasterType
      ]
    ) {
      return indicator.description[this.country.countryCodeISO3][
        this.disasterType.disasterType
      ];
    }

    return '';
  }

  private onLayerChange = (layers: IbfLayerMetadata[]): void => {
    console.log(`🗂️ MapService: onLayerChange called with ${layers.length} layers:`, layers.map(l => l.name));
    
    layers.forEach((layer: IbfLayerMetadata) => {
      const layerActive = this.getActiveState(layer);
      console.log(`🗂️ Processing layer: ${layer.name}, active: ${layerActive}, type: ${layer.type}`);

      if (layer.type === IbfLayerType.wms) {
        this.loadWmsLayer(layer, layerActive, layer.leadTimeDependent);
      } else if (layer.name === IbfLayerName.adminRegions1) {
        // Only load if current admin level matches
        if (this.adminLevel === AdminLevel.adminLevel1) {
          this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel1);
        }
      } else if (layer.name === IbfLayerName.adminRegions2) {
        // Only load if current admin level matches
        if (this.adminLevel === AdminLevel.adminLevel2) {
          this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel2);
        }
      } else if (layer.name === IbfLayerName.adminRegions3) {
        // Only load if current admin level matches  
        if (this.adminLevel === AdminLevel.adminLevel3) {
          this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel3);
        }
      } else if (layer.name === IbfLayerName.adminRegions4) {
        // Only load if current admin level matches
        if (this.adminLevel === AdminLevel.adminLevel4) {
          this.loadAdminRegionLayer(layerActive, AdminLevel.adminLevel4);
        }
      } else if (layer.name === IbfLayerName.typhoonTrack) {
        this.loadTyphoonTrackLayer(layer, layerActive);
      } else if (layer.type === IbfLayerType.point) {
        // NOTE: any non-standard point layers should be placed above this 'else if'!
        this.loadPointDataLayer(layer, layerActive);
      }
    });
  };

  private loadTyphoonTrackLayer(layer: IbfLayerMetadata, layerActive: boolean) {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getTyphoonTrack(
            this.country.countryCodeISO3,
            this.eventState?.event?.eventName,
          )
          .subscribe((trackData) => {
            this.addTyphoonTrackLayer(layer, trackData);
          });
      } else {
        this.addTyphoonTrackLayer(layer, null);
      }
    }
  }

  private addTyphoonTrackLayer = (
    layer: IbfLayerMetadata,
    typhoonTrack: GeoJSON.FeatureCollection,
  ) => {
    this.addLayer({
      name: IbfLayerName.typhoonTrack,
      label: IbfLayerLabel.typhoonTrack,
      type: IbfLayerType.point,
      group: IbfLayerGroup.point,
      description: this.getPopoverText(layer),
      active: this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(
            IbfLayerName.typhoonTrack,
          )
        : true,
      show: true,
      data: typhoonTrack,
      viewCenter: false,
      order: 0,
    });
  };

  private loadPointDataLayer = (
    layer: IbfLayerMetadata,
    layerActive: boolean,
  ) => {
    if (this.country) {
      if (layerActive) {
        this.apiService
          .getPointData(
            this.country.countryCodeISO3,
            layer.name,
            this.disasterType.disasterType,
          )
          .subscribe((pointData) => {
            this.addPointDataLayer(layer, pointData);
          });
      } else {
        this.addPointDataLayer(layer, null);
      }
    }
  };

  private addPointDataLayer = (
    layer: IbfLayerMetadata,
    pointData: GeoJSON.FeatureCollection,
  ) => {
    this.addLayer({
      name: layer.name,
      label: layer.label,
      type: IbfLayerType.point,
      group: IbfLayerGroup.point,
      description: this.getPopoverText(layer),
      active: this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(layer.name)
        : this.getActiveState(layer),
      show: true,
      data: pointData,
      viewCenter: false,
      order: 1,
    });
  };

  private loadAdminRegionLayer(layerActive: boolean, adminLevel: AdminLevel) {
    console.log(`🎯 MapService: loadAdminRegionLayer called - active: ${layerActive}, level: ${adminLevel} (${typeof adminLevel}), currentLevel: ${this.adminLevel} (${typeof this.adminLevel})`);
    console.log(`🎯 MapService: Comparison result: ${adminLevel === this.adminLevel}, strict equal: ${adminLevel === this.adminLevel}, loose equal: ${adminLevel == this.adminLevel}`);
    
    // Add null checks for country and disasterType
    if (!this.country || !this.disasterType) {
      console.log(`🎯 MapService: Cannot load admin regions - missing country: ${!!this.country}, disasterType: ${!!this.disasterType}`);
      this.addAdminRegionLayer(null, adminLevel);
      return;
    }
    
    if (layerActive && adminLevel === this.adminLevel) {
      // Ensure timelineState exists
      if (!this.timelineState) {
        console.log(`🎯 MapService: Cannot load admin regions - missing timelineState`);
        this.addAdminRegionLayer(null, adminLevel);
        return;
      }
      
      // Use disaster-specific admin areas to show only triggered areas
      const currentEvent = this.eventService.state?.event;
      const eventName = currentEvent?.eventName || null;
      
      console.log(`🎯 MapService: Loading admin regions for event: ${eventName || 'no event'}`);
      
      this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineState.activeLeadTime,
          adminLevel,
          eventName || '', // Use actual event name from EventService
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((adminRegions) => {
          console.log(`🎯 MapService: Received admin regions data:`, adminRegions);
          this.addAdminRegionLayer(adminRegions, adminLevel);
          const regionsCount = adminRegions?.features?.length || 0;
          if (eventName && regionsCount > 0) {
            console.log(`✅ Loaded ${regionsCount} disaster-specific admin regions for event: ${eventName}`);
          } else if (eventName && regionsCount === 0) {
            console.log(`⚠️ No triggered areas found for event: ${eventName}`);
          } else {
            console.log(`📍 Loaded ${regionsCount} admin regions (no event context)`);
          }
        });
    } else {
      console.log(`🎯 MapService: Not loading admin regions - active: ${layerActive}, adminLevel match: ${adminLevel === this.adminLevel}`);
      console.log(`🎯 MapService: Detailed comparison - adminLevel: ${adminLevel} (${typeof adminLevel}), this.adminLevel: ${this.adminLevel} (${typeof this.adminLevel}), undefined check: ${this.adminLevel === undefined}`);
      this.addAdminRegionLayer(null, adminLevel);
    }
  }

  private addAdminRegionLayer(
    adminRegions: GeoJSON.FeatureCollection,
    adminLevel: AdminLevel,
  ) {
    this.addLayer({
      name: `${IbfLayerGroup.adminRegions}${adminLevel.toString()}` as IbfLayerName,
      label:
        `${IbfLayerGroup.adminRegions}${adminLevel.toString()}` as IbfLayerLabel,
      group: IbfLayerGroup.adminRegions,
      type: IbfLayerType.shape,
      description: '',
      active: this.adminLevel === adminLevel,
      show: true,
      data: adminRegions,
      viewCenter: this.adminLevel === adminLevel,
      colorProperty: this.disasterType?.mainExposureIndicator || 'population_affected',
      order: 0,
    });
  }

  public loadAggregateLayer(indicator: Indicator) {
    if (!this.country || !this.disasterType) {
      return;
    }

    if (
      indicator.countryDisasterTypes[this.country.countryCodeISO3][
        this.disasterType.disasterType
      ]?.includes('map')
    ) {
      const layerActive = this.adminLevelService.activeLayerNames.length
        ? this.adminLevelService.activeLayerNames.includes(indicator.name)
        : this.getActiveState(indicator);

      if (layerActive && this.timelineState) {
        this.getCombineAdminRegionData(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.adminLevel,
          indicator.name,
          indicator.dynamic,
          this.timelineState.activeLeadTime,
          this.eventState?.event?.eventName,
        ).subscribe((adminRegions) => {
          this.addAggregateLayer(indicator, adminRegions, layerActive);
        });
      } else {
        this.addAggregateLayer(indicator, null, layerActive);
      }
    }
  }

  private getActiveState(
    indicatorOrLayer: IbfLayerMetadata | Indicator,
  ): boolean {
    if (indicatorOrLayer.active === LayerActivation.yes) {
      return true;
    }

    if (
      indicatorOrLayer.active === LayerActivation.ifTrigger &&
      this.eventState?.events?.length > 0
    ) {
      return true;
    }

    return false;
  }

  private addAggregateLayer(
    indicator: Indicator,
    adminRegions: GeoJSON.FeatureCollection,
    active: boolean,
  ) {
    this.addLayer({
      name: indicator.name,
      label: indicator.label,
      type: IbfLayerType.shape,
      description: this.getPopoverText(indicator),
      active,
      show: true,
      data: adminRegions,
      viewCenter: true,
      colorProperty: indicator.name,
      colorBreaks: indicator.colorBreaks,
      numberFormatMap: indicator.numberFormatMap,
      legendColor: this.eventState.events?.length
        ? this.state.colorGradientAlert[2]
        : this.state.colorGradientNoAlert[2],
      group:
        indicator.name === IbfLayerName.trigger
          ? IbfLayerGroup.outline
          : IbfLayerGroup.aggregates,
      order: 20 + indicator.order,
      dynamic: indicator.dynamic,
      unit: indicator.unit,
    });
  }

  private filterNonAggregateLayers = (layer: IbfLayer): boolean =>
    layer.group !== IbfLayerGroup.aggregates &&
    layer.group !== IbfLayerGroup.outline;

  public removeAggregateLayers = (): void => {
    this.layers = this.layers.filter(this.filterNonAggregateLayers);
  };

  private loadWmsLayer(
    layer: IbfLayerMetadata,
    active: boolean,
    leadTimeDependent?: boolean,
  ) {
    this.addLayer({
      name: layer.name,
      label: layer.label,
      type: IbfLayerType.wms,
      group: IbfLayerGroup.wms,
      description: this.getPopoverText(layer),
      active,
      show: true,
      viewCenter: false,
      data: null,
      legendColor: layer.legendColor,
      order: 10,
      wms: {
        url: environment.geoserverUrl,
        leadTimeDependent,
        format: 'image/png',
        version: '1.1.0',
        attribution: '510 Global',
        crs: CRS.EPSG4326,
        transparent: true,
        viewparams: `countryCodeISO3:${this.country.countryCodeISO3}`,
      } as IbfLayerWMS,
    });
  }

  private addLayer(layer: IbfLayer): void {
    const { name, viewCenter, data } = layer;
    // cache the data if available
    const layerDataCacheKey = this.getLayerDataCacheKey(layer.name);

    if (data) {
      this.layerDataCache[layerDataCacheKey] = data;
    }

    if (viewCenter && data?.features?.length) {
      const layerBounds = bbox(data);

      this.state.bounds = containsNumber(layerBounds)
        ? ([
            [layerBounds[1], layerBounds[0]],
            [layerBounds[3], layerBounds[2]],
          ] as LatLngBoundsLiteral)
        : this.state.bounds;
    }
    this.layerSubject.next(layer);

    const layerIndex = this.getLayerIndexByName(name);

    if (layerIndex >= 0) {
      this.layers.splice(layerIndex, 1, layer);
    } else {
      this.layers.push(layer);
    }
  }

  getLayerSubscription(): Observable<IbfLayer> {
    return this.layerSubject.asObservable();
  }

  private getLayerIndexByName = (name: IbfLayerName): number =>
    this.layers.findIndex((layer: IbfLayer) => layer.name === name);

  public getLayerByName = (layerName: IbfLayerName): IbfLayer | null => {
    const index = this.getLayerIndexByName(layerName);
    return index !== -1 ? this.layers[index] : null;
  };

  private isLayerActive = (
    layer: IbfLayer,
    interactedLayer: IbfLayer,
  ): boolean => {
    if (
      layer.group === IbfLayerGroup.outline &&
      this.eventState?.events?.length > 0
    ) {
      return true;
    }

    const isActiveDefined = interactedLayer.active != null;
    const isInteractedLayer = layer.name === interactedLayer.name;
    const isInteractedLayerGroup = layer.group === interactedLayer.group;
    let isActive = layer.active;

    if (isActiveDefined && isInteractedLayerGroup) {
      if (isInteractedLayer) {
        isActive = interactedLayer.active;
      } else {
        if (layer.group) {
          isActive = false;
        }
      }
    }

    return isActive;
  };

  private isLayerShown = (
    layer: IbfLayer,
    interactedLayer: IbfLayer,
  ): boolean => {
    return interactedLayer.show == null || layer.name !== interactedLayer.name
      ? layer.show
      : interactedLayer.show;
  };

  private updateLayer =
    (layer: IbfLayer) => (layerData: GeoJSON.FeatureCollection) => {
      this.addLayer({
        name: layer.name,
        label: layer.label,
        type: layer.type,
        description: layer.description,
        active: this.adminLevelService.activeLayerNames.length
          ? this.adminLevelService.activeLayerNames.includes(layer.name)
          : layer.active,
        viewCenter: false,
        data: layerData,
        wms: layer.wms,
        colorProperty:
          layer.group === IbfLayerGroup.adminRegions
            ? this.disasterType?.mainExposureIndicator || 'population_affected'
            : layer.colorProperty,
        colorBreaks: layer.colorBreaks,
        numberFormatMap: layer.numberFormatMap,
        legendColor: layer.legendColor,
        group: layer.group,
        order: layer.order,
        unit: layer.unit,
        dynamic: layer.dynamic,
        show: layer.show,
      });
    };

  public toggleLayer = (layer: IbfLayer): void => {
    if (!layer) {
      console.warn('toggleLayer called with undefined/null layer');
      return;
    }
    
    layer.active = !layer.active;
    this.adminLevelService.activeLayerNames = [];
    this.updateLayers(layer);
  };

  private getLayerDataCacheKey(layerName: IbfLayerName): string {
    if (layerName === IbfLayerName.waterpoints) {
      return `${this.country.countryCodeISO3}_${layerName}`;
    } else {
      return `${this.country.countryCodeISO3}_${this.disasterType.disasterType}_${this.timelineState.activeLeadTime}_${this.adminLevel.toString()}_${layerName}`;
    }
  }

  private updateLayers = (newLayer: IbfLayer): void => {
    this.layers.forEach((layer: IbfLayer): void => {
      if (
        layer.name === newLayer.name ||
        layer.group === IbfLayerGroup.aggregates ||
        layer.group === IbfLayerGroup.outline
      ) {
        const layerDataCacheKey = this.getLayerDataCacheKey(layer.name);

        layer.active = this.isLayerActive(layer, newLayer);
        layer.show = this.isLayerShown(layer, newLayer);
        if (this.layerDataCache[layerDataCacheKey]) {
          const layerData: GeoJSON.FeatureCollection =
            this.layerDataCache[layerDataCacheKey];

          this.updateLayer(layer)(layerData);
        } else if (layer.active) {
          this.getLayerData(layer).subscribe((layerDataResponse) => {
            this.layerDataCache[layerDataCacheKey] = layerDataResponse;
            this.updateLayer(layer)(layerDataResponse);
          });
        }
      }
    });
  };

  private getLayerData = (
    layer: IbfLayer,
  ): Observable<GeoJSON.FeatureCollection> => {
    let layerData: Observable<GeoJSON.FeatureCollection>;

    if (layer.name === IbfLayerName.typhoonTrack) {
      layerData = this.apiService
        .getTyphoonTrack(
          this.country.countryCodeISO3,
          this.eventState?.event?.eventName,
        )
        .pipe(shareReplay(1));
    } else if (layer.type === IbfLayerType.point) {
      // NOTE: any non-standard point layers should be placed above this 'else if'!
      layerData = this.apiService
        .getPointData(
          this.country.countryCodeISO3,
          layer.name,
          this.disasterType.disasterType,
        )
        .pipe(shareReplay(1));
    } else if (layer.name === IbfLayerName.adminRegions) {
      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineState.activeLeadTime,
          this.adminLevel,
          this.eventState?.event?.eventName,
          this.getPlaceCodeParent(),
        )
        .pipe(shareReplay(1));
    } else if (layer.group === IbfLayerGroup.adminRegions) {
      const adminLevel = Number(layer.name.slice(-1)) as AdminLevel;

      layerData = this.apiService
        .getAdminRegions(
          this.country.countryCodeISO3,
          this.disasterType.disasterType,
          this.timelineState.activeLeadTime,
          adminLevel,
          this.eventState?.event?.eventName,
          this.getPlaceCodeParent(),
        )
        .pipe(shareReplay(1));
    } else if (
      layer.group === IbfLayerGroup.aggregates ||
      layer.group === IbfLayerGroup.outline
    ) {
      layerData = this.getCombineAdminRegionData(
        this.country.countryCodeISO3,
        this.disasterType.disasterType,
        this.adminLevel,
        layer.name,
        layer.dynamic,
        this.timelineState.activeLeadTime,
        this.eventState?.event?.eventName,
      ).pipe(shareReplay(1));
    } else {
      layerData = of(null);
    }

    return layerData;
  };

  public getPlaceCodeParent(placeCode?: PlaceCode): string {
    placeCode = placeCode || this.placeCode;

    const adminLevelType = this.adminLevelService.getAdminLevelType(placeCode);

    return adminLevelType === AdminLevelType.single
      ? null // on single admin: don't pass any parentPlaceCode filtering
      : adminLevelType === AdminLevelType.deepest
        ? placeCode?.placeCodeParent.placeCode // on deepest admin: pass parentPlaceCode
        : placeCode?.placeCode; // on higher levels: pass current placeCode (TODO: why this last difference?)
  }

  getCombineAdminRegionData(
    countryCodeISO3: string,
    disasterType: DisasterTypeKey,
    adminLevel: AdminLevel,
    layerName: IbfLayerName,
    dynamic: boolean,
    leadTime: LeadTime,
    eventName: string,
  ): Observable<GeoJSON.FeatureCollection> {
    // Do api request to get data layer
    let admDynamicDataObs: Observable<{ value: number; placeCode: string }[]>;

    if (dynamic) {
      admDynamicDataObs = this.apiService.getAdminAreaDynamicData(
        countryCodeISO3,
        adminLevel,
        leadTime,
        layerName,
        disasterType,
        eventName,
      );
    } else {
      admDynamicDataObs = this.apiService.getAdminAreaData(
        countryCodeISO3,
        adminLevel,
        layerName,
      );
    }

    // Get the geometry from the admin region (this should re-use the cache if that is already loaded)
    // TODO: I'm convinced this is not working as intended and does not re-use cache and does unneeded /admin-area calls
    const adminRegionsLayer = new IbfLayer();

    adminRegionsLayer.name = IbfLayerName.adminRegions;

    const adminRegionsObs = this.getLayerData(adminRegionsLayer);

    // Combine results
    return zip(admDynamicDataObs, adminRegionsObs).pipe(
      map(([admDynamicData, adminRegions]) => {
        const updatedFeatures = [];

        for (const area of adminRegions?.features || []) {
          const foundAdmDynamicEntry = admDynamicData.find(
            (admDynamicEntry): number => {
              if (
                area.properties?.['placeCode'] === admDynamicEntry.placeCode
              ) {
                return admDynamicEntry.value;
              }
            },
          );

          area.properties['indicators'] = {};

          area.properties['indicators'][layerName] = foundAdmDynamicEntry
            ? foundAdmDynamicEntry.value
            : null;

          updatedFeatures.push(area);
        }

        return adminRegions;
      }),
    );
  }

  getAdminRegionFillColor = (
    colorPropertyValue,
    colorThreshold: { break0: number },
  ): string => {
    let adminRegionFillColor = this.state.defaultFillColor;
    const currentColorGradient = this.eventState.events?.length
      ? this.state.colorGradientAlert
      : this.state.colorGradientNoAlert;

    switch (true) {
      case colorPropertyValue === null:
        adminRegionFillColor = this.state.noDataColor;
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break1] ||
        !colorThreshold[breakKey.break1]:
        adminRegionFillColor = currentColorGradient[0];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break2] ||
        !colorThreshold[breakKey.break2]:
        adminRegionFillColor = currentColorGradient[1];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break3] ||
        !colorThreshold[breakKey.break3]:
        adminRegionFillColor = currentColorGradient[2];
        break;
      case colorPropertyValue <= colorThreshold[breakKey.break4] ||
        !colorThreshold[breakKey.break4]:
        adminRegionFillColor = currentColorGradient[3];
        break;
      case colorPropertyValue > colorThreshold[breakKey.break4]:
        adminRegionFillColor = currentColorGradient[4];
        break;
      default:
        adminRegionFillColor = this.state.defaultFillColor;
    }

    return adminRegionFillColor;
  };

  getOutlineWeight(
    colorPropertyValue: number,
    placeCode: string,
    placeCodeParent: string,
    area: AlertArea,
  ) {
    let weight = colorPropertyValue === 1 ? 3 : 0.33;

    if (this.placeCode) {
      if (
        ![placeCode, placeCodeParent].includes(this.placeCode.placeCode) &&
        area
      ) {
        weight = weight / 3; // Decrease weight of unselected triggered areas
      }
    }

    return weight;
  }

  getOutlineColor(colorPropertyValue: number) {
    return colorPropertyValue === 1
      ? this.triggeredAreaColor
      : this.nonTriggeredAreaColor;
  }

  getAdminRegionFillOpacity = (layer: IbfLayer): number => {
    let fillOpacity = this.state.defaultFillOpacity;

    if (layer.group === IbfLayerGroup.adminRegions) {
      fillOpacity = 0.0;
    }

    return fillOpacity;
  };

  getAdminRegionWeight = (layer: IbfLayer, placeCode: string): number => {
    let weight =
      layer.name === IbfLayerName.adminRegions
        ? this.state.defaultWeight
        : layer.group === IbfLayerGroup.adminRegions
          ? this.adminLevelLowerThanDefault(layer.name)
            ? 3
            : 0.33
          : this.state.defaultWeight;

    if (this.placeCode) {
      const areaState = this.alertAreas.find(
        (area) => area.placeCode === placeCode,
      );

      if (this.placeCode.placeCode === placeCode && !areaState) {
        weight = 3; // Give weight of selected non-triggered area of 3 (from nothing)
      }
    }

    return weight;
  };

  adminLevelLowerThanDefault = (name: IbfLayerName): boolean => {
    return name.slice(-1) < String(this.adminLevel);
  };

  getAdminRegionColor = (layer: IbfLayer): string => {
    return layer.group === IbfLayerGroup.adminRegions
      ? this.state.strokeColor
      : this.state.transparentColor;
  };

  public getColorThreshold = (
    adminRegions: GeoJSON.FeatureCollection,
    colorProperty: string,
    colorBreaks: ColorBreaks,
  ): { break0: number } => {
    if (colorBreaks) {
      const colorThresholdWithBreaks = { break0: 0 };

      Object.keys(colorBreaks).forEach((colorBreak) => {
        if (colorBreaks[String(Number(colorBreak) + 1)]) {
          colorThresholdWithBreaks[`break${colorBreak}`] =
            colorBreaks[colorBreak].valueHigh;
        }
      });

      return colorThresholdWithBreaks;
    }

    const colorPropertyValues: number[] = adminRegions.features
      .map((feature) =>
        typeof feature.properties[colorProperty] !== 'undefined'
          ? feature.properties[colorProperty]
          : feature.properties['indicators']?.[colorProperty],
      )
      .filter((v, i, a) => a.indexOf(v) === i);
    const colorThreshold = {
      break0: quantile(colorPropertyValues, 0.0),
      break1: quantile(colorPropertyValues, 0.2),
      break2: quantile(colorPropertyValues, 0.4),
      break3: quantile(colorPropertyValues, 0.6),
      break4: quantile(colorPropertyValues, 0.8),
    };

    return colorThreshold;
  };

  public setOutlineLayerStyle = (layer: IbfLayer) => {
    const colorProperty = layer.colorProperty;

    return (adminRegion) => {
      const placeCode: string = adminRegion?.properties?.placeCode;
      const placeCodeParent: string = adminRegion?.properties?.placeCodeParent;
      const area = this.getAreaByPlaceCode(placeCode, placeCodeParent);
      const colorPropertyValue: number =
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : adminRegion.properties.indicators[colorProperty];
      const color = this.getOutlineColor(colorPropertyValue);
      const weight = this.getOutlineWeight(
        colorPropertyValue,
        placeCode,
        placeCodeParent,
        area,
      );

      return { opacity: 1, color, fillOpacity: 0, weight };
    };
  };

  public setAdminRegionStyle = (layer: IbfLayer) => {
    const colorProperty = layer.colorProperty;
    const colorThreshold: { break0: number } = this.getColorThreshold(
      layer.data,
      colorProperty,
      layer.colorBreaks,
    );

    return (adminRegion) => {
      const placeCode: string = adminRegion.properties.placeCode;
      const colorPropertyValue: string =
        typeof adminRegion.properties[colorProperty] !== 'undefined'
          ? adminRegion.properties[colorProperty]
          : typeof adminRegion.properties.indicators !== 'undefined'
            ? adminRegion.properties.indicators[colorProperty]
            : 'undefined';

      if (colorPropertyValue !== 'undefined') {
        const fillColor = this.getAdminRegionFillColor(
          colorPropertyValue,
          colorThreshold,
        );
        const fillOpacity = this.getAdminRegionFillOpacity(layer);
        const weight = this.getAdminRegionWeight(layer, placeCode);
        const color = this.getAdminRegionColor(layer);

        return {
          fillColor,
          fillOpacity,
          weight,
          color,
          className: `admin-boundary ${layer.name}`,
        };
      }
    };
  };

  public getAreaByPlaceCode(
    placeCode: string,
    placeCodeParent: string,
  ): AlertArea {
    return (
      this.alertAreas.find((area) => area.placeCode === placeCode) ||
      this.alertAreas.find((area) => area.placeCode === placeCodeParent) // in multi-admin the map placeCode can differ 1 level from the chat/triggeredArea placeCode
    );
  }

  public setAdminRegionMouseOverStyle = (
    placeCode: string,
    placeCodeParent: string,
  ) => {
    const area = this.getAreaByPlaceCode(placeCode, placeCodeParent);

    if (!area) {
      const layer = this.layers.find((l) => l.name === IbfLayerName.trigger);
      
      // Add defensive checks to prevent "Cannot read properties of undefined" error
      if (!layer || !layer.data || !layer.data.features) {
        console.warn('⚠️ Layer data not available for mouse over style');
        return {
          color: this.nonTriggeredAreaColor,
          weight: 5,
        };
      }
      
      const feature = layer.data.features.find(
        (f) => f && f.properties && f.properties['placeCode'] === placeCode,
      );
      
      if (!feature || !feature.properties || !feature.properties['indicators']) {
        console.warn('⚠️ Feature or properties not available for placeCode:', placeCode);
        return {
          color: this.nonTriggeredAreaColor,
          weight: 5,
        };
      }
      
      const triggered = feature.properties['indicators'][IbfLayerName.trigger];

      return {
        color: triggered ? this.triggeredAreaColor : this.nonTriggeredAreaColor,
        weight: 5,
      };
    }

    if (area.alertLevel !== AlertLevel.TRIGGER) {
      return { color: this.nonTriggeredAreaColor, weight: 5 };
    }

    return { color: this.triggeredAreaColor, weight: 5 };
  };

  ngOnDestroy(): void {
    console.log('🗂️ MapService: ngOnDestroy called - cleaning up subscriptions');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
